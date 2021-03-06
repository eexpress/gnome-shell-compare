const { GObject, GLib, Pango, St } = imports.gi;
const { Meta, Gio, Shell } = imports.gi; // for Keybinding

const ExtensionUtils = imports.misc.extensionUtils;
const Main = imports.ui.main;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const ByteArray = imports.byteArray;

const _domain = Me.metadata['gettext-domain'];	//"compare"
const Gettext = imports.gettext.domain(_domain);
const _ = Gettext.gettext;

const debug = false;
//~ const debug = true;
function lg(s) {
	if (debug) log("===" + _domain + "===>" + s);
}

let clip0 = "";
let clip1 = "";
let [lazytext, lazystate] = [ "", false ]; //不弹窗时，临时保存现场。

const Indicator = GObject.registerClass(
	class Indicator extends PanelMenu.Button {
		_init() {
			super._init(0.0, _(Me.metadata['name']));
			const that = this;

			//~ this.settings = ExtensionUtils.getSettings("org.gnome.shell.extensions." + _domain);
			this.settings = ExtensionUtils.getSettings();

			this.add_child(new St.Icon({ gicon : Gio.icon_new_for_string(Me.path + "/compare-open-symbolic.svg"), style_class : 'system-status-icon' }));
			this.menu.connect('open-state-changed', (menu, open) => {
				if (open && this.mauto.state == false && lazytext.length > 3) { judge(lazytext, lazystate); }
			});

			this.mauto = new PopupMenu.PopupSwitchMenuItem('', this.settings.get_boolean('auto-pop'));
			this.mauto.label.clutter_text.set_markup(_('▶ Auto pop menu').bold());
			this.menu.addMenuItem(this.mauto);
			this.msame = new PopupMenu.PopupSwitchMenuItem('', this.settings.get_boolean('same-clip'));
			this.msame.label.clutter_text.set_markup(_('▶ CLIPBOARD act as PRIMARY').bold());
			this.menu.addMenuItem(this.msame);
			this.mloc = new PopupMenu.PopupSwitchMenuItem('', this.settings.get_boolean('use-locate'));
			this.mloc.label.clutter_text.set_markup(_('▶ Strong find file using locate').bold());
			this.menu.addMenuItem(this.mloc);

			const item = new PopupMenu.PopupMenuItem('');
			item.label.clutter_text.set_markup(_('▶ Compare two Dirs/Files below.').bold());
			item.connect('activate', () => {
				GLib.spawn_command_line_async('meld "%s" "%s"'.format(item0.file, item1.file));
			});
			item.reactive = false;
			this.menu.addMenuItem(item);

			const item0 = new PopupMenu.PopupMenuItem('');
			item0.connect('activate', actor => this.default_open(item0.file));
			item0.file = '';
			item0.mime = '';
			item0.reactive = false;
			this.menu.addMenuItem(item0);
			const item1 = new PopupMenu.PopupMenuItem('');
			item1.connect('activate', actor => this.default_open(item1.file));
			item1.file = '';
			item1.mime = '';
			item1.reactive = false;
			this.menu.addMenuItem(item1);
			markup();

			this._selection = global.display.get_selection();
			this._clipboard = St.Clipboard.get_default();
			this._ownerChangedId = this._selection.connect('owner-changed', () => {
				this._clipboard.get_text(St.ClipboardType.CLIPBOARD, (clipboard, text) => {
					if (!text || text.length < 4) return;
					if (text != clip0) { // new clip
						if (text.indexOf("\n") > 0) return;
						clip0 = text;
						if (this.mauto.state)
							judge(text, this.msame.state);
						else
							[lazytext, lazystate] = [ text.trim(), true ];
					}
				});
				this._clipboard.get_text(St.ClipboardType.PRIMARY, (clipboard, text) => {
					if (!text || text.length < 4) return; //文本太短的pass，避免鼠标频发触发选择。
					if (text != clip1) { // new clip
						text = text.trim();
						if (text.indexOf("\n") > 0) return;
						clip1 = text;
						if (this.mauto.state)
							judge(text.trim(), true);
						else
							[lazytext, lazystate] = [ text.trim(), true ];
					}
				});
			});

			Main.wm.addKeybinding("open-last-file-in-termianl", ExtensionUtils.getSettings(), Meta.KeyBindingFlags.NONE, Shell.ActionMode.ALL, () => {
				if (item1.file)
					this.default_open(item1.file);
				else if (item0.file)
					this.default_open(item0.file);
			});

			// 大量使用 item0, item1 的函数，搬出init麻烦。所有 item0 都要加 this，包括init内。
			// init 内函数，只好使用 that 调用 init 外部的函数。
			function judge(text, isPRIMARY) {
				[lazytext, lazystate] = [ "", false ];
				// filt mess charactor, []()
				if (!add_menu(text, isPRIMARY) && this.mloc.state) {
					text = that.loc_file(text);
					if (text) add_menu(text, isPRIMARY);
				}
			}

			function add_menu(text, isPRIMARY) {
				if (text.indexOf("~/") == 0) {
					text = GLib.get_home_dir() + text.substr(1);
				}
				if (GLib.file_test(text, GLib.FileTest.IS_REGULAR | GLib.FileTest.IS_DIR)) {
					//~ 当前目录是~，所以带./前缀的文件，都认为是~/的文件。
					const contentType = that.get_content_type(text);
					item0.file = item1.file;
					item0.mime = item1.mime;
					item0.reactive = item1.reactive;
					item1.file = text;
					item1.mime = contentType;
					item1.reactive = isPRIMARY;
					//~ 无法统计 meld 支持的文件类型，没法过滤判断。
					if (item0.mime == item1.mime)
						item.reactive = true;
					else
						item.reactive = false;

					markup();
					that.menu._getMenuItems().forEach((j) => {if(j.cmd) j.destroy(); });
					if (isPRIMARY) that.get_context_menu(text);
					return true;
				}
				return false;
			};

			function markup() {

				for (let i = 0; i < 2; i++) { // 强制循环刷新
					const a = (i == 0) ? item0 : item1;
					if (!a.file) {
						a.label.text = (i + 1) + ":";
						a.reactive = false;
					} else {
						const head = a.file.split("/");
						const last = head.pop();
						let dir = head.join("/");
						if (dir.length > 0) dir += "/";
						const pango = ((i + 1) + ": ").bold() + dir + last.bold().italics().fontcolor("#879CFF").replace(/font/g, "span");
						a.label.clutter_text.set_ellipsize(Pango.EllipsizeMode.MIDDLE);
						a.label.clutter_text.set_markup(pango);
					}
				}
			}
		}

		loc_file(str) { //找到两个的，就认为无效。
			if (str.charAt(str.length - 1) == '/') str = str.substr(0, str.length - 1);
			if (str.indexOf("/") > 0) { //`find` output
				// delete prefix '.'
				str = "*" + str.substr(str.indexOf(".") == 0 ? 1 : 0);
			} else { //`ls` output
				str = "*/" + str;
			}

			let ret = GLib.spawn_command_line_sync(`locate -n 10 -w '${str}'`);
			if ((ret[0]) && (ret[3] == 0)) { // ok, exit_status = 0
				const lf = ByteArray.toString(ret[1]).split("\n");
				lg(lf);
				const lff = lf.filter(item => item.indexOf('/.') === -1 && item);
				lg(lff);
				if (lff.length == 1)
					return lff[0];
				else
					return null;
			}
			return null;
		};

		get_context_menu(text) {
			try {
				const contentType = this.get_content_type(text);
				const apps = Gio.AppInfo.get_recommended_for_type(contentType);
				if (apps) this.create_context_menu(text, apps);
			} catch (e) { lg(e); }
		}

		create_context_menu(text, apps) {
			const cm = new PopupMenu.PopupMenuItem('');
			cm.label.clutter_text.set_markup(_('▶ Use Ctrl-O or those App to open the last file:').bold());
			cm.reactive = false;
			cm.cmd = '--xxx--';
			this.menu.addMenuItem(cm);
			apps.forEach((i) => {
				const ca = new PopupMenu.PopupImageMenuItem(i.get_display_name(), i.get_icon());
				ca.cmd = i.get_commandline();
				ca.connect('activate', (actor) => {
					let cmd = actor.cmd;
					const re = /\%[uUfF]/;
					cmd = cmd.replace(re, `"${text}"`);
					GLib.spawn_command_line_async(cmd);
				});
				this.menu.addMenuItem(ca);
			});
			if (this.mauto.state) this.menu.open();
		}

		default_open(str) {
			//~ GLib.spawn_command_line_async(`xdg-open "${str}"`);
			Gio.app_info_launch_default_for_uri(`file://${str}`, global.create_app_launch_context(0, -1));
		};

		get_content_type(str) {
			try {
				const f0 = Gio.File.new_for_path(str);
				const f1 = f0.query_info(Gio.FILE_ATTRIBUTE_STANDARD_CONTENT_TYPE, Gio.FileQueryInfoFlags.NONE, null);
				const contentType = f1.get_content_type();
				return contentType;
			} catch (e) {
				lg(e);
				return null;
			}
		}

		destroy() {
			this.settings.set_boolean('auto-pop', this.mauto.state);
			this.settings.set_boolean('same-clip', this.msame.state);
			this.settings.set_boolean('use-locate', this.mloc.state);
			this._selection.disconnect(this._ownerChangedId);
			if (this._actor) this._actor.destroy();
			super.destroy();
		}
	});

class Extension {
	constructor(uuid) {
		this._uuid = uuid;

		ExtensionUtils.initTranslations();
	}

	enable() {
		lg("start");
		this._indicator = new Indicator();
		Main.panel.addToStatusArea(this._uuid, this._indicator);
	}

	disable() {
		lg("stop");
		this._indicator.destroy();
		this._indicator = null;
		Main.wm.removeKeybinding("open-last-file-in-termianl");
	}
}

function init(meta) {
	return new Extension(meta.uuid);
}
