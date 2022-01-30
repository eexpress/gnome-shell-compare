
const GETTEXT_DOMAIN = 'compare';
function lg(s){log("==="+GETTEXT_DOMAIN+"===>"+s)};
let file = [];
let clip0 = "";

const { GObject, GLib, St } = imports.gi;

const Gettext = imports.gettext.domain(GETTEXT_DOMAIN);
const _ = Gettext.gettext;

const ExtensionUtils = imports.misc.extensionUtils;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
	_init() {
		super._init(0.0, _('Compare Dir/File'));

		this.add_child(new St.Icon({
			icon_name: 'tools-check-spelling-symbolic',
			style_class: 'system-status-icon',
		}));

		let item = new PopupMenu.PopupMenuItem(_('Compare this two Dirs/Files below.'));
		item.connect('activate', () => { comp(); });
		this.menu.addMenuItem(item);

		let item0 = new PopupMenu.PopupMenuItem('1: ');
		item0.reactive = false;
		this.menu.addMenuItem(item0);
		let item1 = new PopupMenu.PopupMenuItem('2: ');
		item1.reactive = false;
		this.menu.addMenuItem(item1);

		this._selection = global.display.get_selection();
		this._clipboard = St.Clipboard.get_default();
		this._ownerChangedId = this._selection.connect('owner-changed', () => {
			this._clipboard.get_text(St.ClipboardType.CLIPBOARD, (clipboard, text) => {
				if(text && text != clip0){	//new clip
					clip0 = text;
					if(GLib.file_test(clip0, GLib.FileTest.IS_REGULAR|GLib.FileTest.IS_DIR)){
						if(file.indexOf(clip0) == -1){	//new file
							file.push(clip0);
							file = file.slice(-2);
							item0.label.text = "1: "+(file[0] || " ");
							item1.label.text = "2: "+(file[1] || " ");
							//~ lg(file);
						}
					}
				}
			});
		});

		function comp(){
			if(file.length < 2){
				Main.notify(_("Need copy 2 Dirs/Files before compare."));
				return 1;
			}
			const f0 = GLib.file_test(file[0], GLib.FileTest.IS_DIR)?1:0;
			const f1 = GLib.file_test(file[1], GLib.FileTest.IS_DIR)?1:0;
			if(f0 != f1){
				Main.notify(_("Different file types."));
				return 1;
			}
			GLib.spawn_command_line_async('meld "%s" "%s"'.format(file[0], file[1]));
			file = [];
			item0.label.text = "1: ";
			item1.label.text = "2: ";
		};
	}
});

class Extension {
	constructor(uuid) {
		this._uuid = uuid;

		ExtensionUtils.initTranslations(GETTEXT_DOMAIN);
	}

	enable() {
		this._indicator = new Indicator();
		Main.panel.addToStatusArea(this._uuid, this._indicator);
		lg("start");
	}

	disable() {
		this._selection.disconnect(this._ownerChangedId);
		lg("stop");
		this._indicator.destroy();
		this._indicator = null;
	}
}

function init(meta) {
	return new Extension(meta.uuid);
}
