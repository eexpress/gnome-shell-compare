
const GETTEXT_DOMAIN = 'compare';
function lg(s){log("==="+GETTEXT_DOMAIN+"===>"+s)};
let file = [];
let clip0 = "";
let clip1 = "";

const { GObject, GLib, Pango, St } = imports.gi;

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
		lg("start");

		this.add_child(new St.Icon({
			icon_name: 'tools-check-spelling-symbolic',
			style_class: 'system-status-icon',
		}));

		let item = new PopupMenu.PopupMenuItem('');
		item.label.clutter_text.set_markup(_('Compare two Dirs/Files below. Or open active one.').bold());
		item.connect('activate', () => { comp(); });
		this.menu.addMenuItem(item);

		let item0 = new PopupMenu.PopupMenuItem('');
		item0.connect('activate', actor => open(0));
		this.menu.addMenuItem(item0);
		let item1 = new PopupMenu.PopupMenuItem('');
		item1.connect('activate', actor => open(1));
		this.menu.addMenuItem(item1);
		markup();

		this._selection = global.display.get_selection();
		this._clipboard = St.Clipboard.get_default();
		this._ownerChangedId = this._selection.connect('owner-changed', () => {
			this._clipboard.get_text(St.ClipboardType.CLIPBOARD, (clipboard, text) => {
				if(text && text != clip0){	//new clip
					clip0 = text; judge(text, false);
				}
			});
			this._clipboard.get_text(St.ClipboardType.PRIMARY, (clipboard, text) => {
				if(text && text != clip1){	//new clip
					clip1 = text; judge(text, true);
				}
			});
		});

		function judge(text, isPRIMARY){
			if(GLib.file_test(text, GLib.FileTest.IS_REGULAR|GLib.FileTest.IS_DIR)){
				if(file.indexOf(text) == -1){	//new file
					file.push(text);
					if(file.length == 1) item0.reactive = isPRIMARY;
					if(file.length == 2) item1.reactive = isPRIMARY;
					if(file.length > 2){
						item0.reactive = item1.reactive;
						item1.reactive = isPRIMARY;	//file from select text, can be opened.
					}
					file = file.slice(-2);
					markup();
				}
			}
		};

		function markup(){
			for(let i=0; i<2; i++){	// 强制循环刷新
				const a = (i == 0) ? item0 : item1;
				if(!file[i]) {a.label.text = (i+1)+":"; a.reactive = false;}
				else {
					const head = file[i].split("/");
					const last = head.pop();
					const pango = ((i+1)+": ").bold()+head.join("/")+"/"+last.bold().italics().fontcolor("#879CFF").replace(/font/g, "span");
					lg(pango);
					a.label.clutter_text.set_ellipsize(Pango.EllipsizeMode.NONE);
					a.label.clutter_text.set_markup(pango);
				}
			}
		};

		function open(i){
			GLib.spawn_command_line_async(`xdg-open "${file[i]}"`);
		};

		function comp(){
			if(file.length < 2){
				Main.notify(_("Need copy 2 Dirs/Files before compare."));
				return 1;
			}
			const f0 = GLib.file_test(file[0], GLib.FileTest.IS_DIR)?1:0;
			const f1 = GLib.file_test(file[1], GLib.FileTest.IS_DIR)?1:0;
			if(f0 != f1){
				Main.notify(_("Different file types cannot be compared."));
				return 1;
			}
			//~ Maybe need test mimetype is all `text/dir`, but mimetype not in GLib.
			GLib.spawn_command_line_async('meld "%s" "%s"'.format(file[0], file[1]));
			file = []; markup(); clip0 = ""; clip1 = "";
		};
	}

	destroy(){
		lg("stop");
		this._selection.disconnect(this._ownerChangedId);
		if (this._actor) this._actor.destroy();
		super.destroy();
	};
});

class Extension {
	constructor(uuid) {
		this._uuid = uuid;

		ExtensionUtils.initTranslations(GETTEXT_DOMAIN);
	}

	enable() {
		this._indicator = new Indicator();
		Main.panel.addToStatusArea(this._uuid, this._indicator);
	}

	disable() {
		this._indicator.destroy();
		this._indicator = null;
	}
}

function init(meta) {
	return new Extension(meta.uuid);
}
