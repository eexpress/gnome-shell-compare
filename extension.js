const { GObject, GLib, Pango, St } = imports.gi;
const { Meta, Gio, Shell } = imports.gi;	//for Keybinding

const ExtensionUtils = imports.misc.extensionUtils;
const Main = imports.ui.main;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const Gettext = imports.gettext.domain(Me.metadata['gettext-domain']);
const _ = Gettext.gettext;

const debug = false;
function lg(s){ if(debug) log("==="+Me.metadata['gettext-domain']+"===>"+s); }
let file = [];
let clip0 = "";
let clip1 = "";

const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
	_init() {
		super._init(0.0, _(Me.metadata['name']));
		lg("start");
		const that = this;

		this.add_child(new St.Icon({ gicon: Gio.icon_new_for_string(Me.path+"/compare-open-symbolic.svg") }));

		const item = new PopupMenu.PopupMenuItem('');
		item.label.clutter_text.set_markup(_('Compare two Dirs/Files below. Or open active one.').bold());
		item.connect('activate', () => { comp(); });
		this.menu.addMenuItem(item);

		const item0 = new PopupMenu.PopupMenuItem('');
		item0.connect('activate', actor => open(0));
		this.menu.addMenuItem(item0);
		const item1 = new PopupMenu.PopupMenuItem('');
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
					clip1 = text.trim(); judge(text.trim(), true);
				}
			});
		});

		Main.wm.addKeybinding("open-last-file-in-termianl", ExtensionUtils.getSettings(), Meta.KeyBindingFlags.NONE, Shell.ActionMode.ALL, () => {
			if(file[1]) open(1); else if(file[0]) open(0);
		});

		function judge(text, isPRIMARY){
			if(GLib.file_test(text, GLib.FileTest.IS_REGULAR|GLib.FileTest.IS_DIR)){
			//~ 当前目录是~，所以带./前缀的文件，都认为是~/的文件。
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
					that.menu._getMenuItems().forEach((j)=>{if(j.cmd) j.destroy();});
					if(isPRIMARY) get_context_menu(text);
				}
			}
		}

		function get_context_menu(text){
			try {
				const f0 = Gio.File.new_for_path(text);
				const f1 = f0.query_info(Gio.FILE_ATTRIBUTE_STANDARD_CONTENT_TYPE, Gio.FileQueryInfoFlags.NONE, null);
				const contentType = f1.get_content_type();
				lg(contentType);
				const apps = Gio.AppInfo.get_recommended_for_type(contentType);
				if(apps) create_context_menu(text, apps);
			} catch (e) { lg(e); }
		}

		function create_context_menu(text, apps){
			const cm = new PopupMenu.PopupMenuItem('');
			cm.label.clutter_text.set_markup(_('Press Ctrl-O to open last file above or select with:').bold());
			cm.reactive = false;
			cm.cmd = '--xxx--';
			that.menu.addMenuItem(cm);
			apps.forEach((i) => {
				const ca = new PopupMenu.PopupImageMenuItem(i.get_display_name(), i.get_icon());
				lg(i.get_display_name());
				ca.cmd = i.get_commandline();
				ca.connect('activate', (actor) => {
					let cmd = actor.cmd;
					const re = /\%[uUfF]/;
					cmd = cmd.replace(re, `"${text}"`);
					lg(cmd);
					GLib.spawn_command_line_async(cmd);
				});
				that.menu.addMenuItem(ca);
			});
			that.menu.open();
		}

		function markup(){
			for(let i=0; i<2; i++){	// 强制循环刷新
				const a = (i == 0) ? item0 : item1;
				if(!file[i]) {a.label.text = (i+1)+":"; a.reactive = false;}
				else {
					const head = file[i].split("/");
					const last = head.pop();
					const pango = ((i+1)+": ").bold()+head.join("/")+"/"+last.bold().italics().fontcolor("#879CFF").replace(/font/g, "span");
					//~ lg(pango);
					a.label.clutter_text.set_ellipsize(Pango.EllipsizeMode.MIDDLE);
					a.label.clutter_text.set_markup(pango);
				}
			}
		};

		function open(i){
			//~ GLib.spawn_command_line_async(`xdg-open "${file[i]}"`);
			Gio.app_info_launch_default_for_uri(`file://${file[i]}`, global.create_app_launch_context(0, -1));
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

		ExtensionUtils.initTranslations();
	}

	enable() {
		this._indicator = new Indicator();
		Main.panel.addToStatusArea(this._uuid, this._indicator);
	}

	disable() {
		this._indicator.destroy();
		this._indicator = null;
		Main.wm.removeKeybinding("open-last-file-in-termianl");
	}
}

function init(meta) {
	return new Extension(meta.uuid);
}
