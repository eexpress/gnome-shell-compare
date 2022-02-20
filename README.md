# gnome-shell-compare

[<img alt="" height="80" src="https://raw.githubusercontent.com/andyholmes/gnome-shell-extensions-badge/master/get-it-on-ego.svg?sanitize=true">](https://extensions.gnome.org/extension/4789/compare-filedir-from-clip/)

---

## Change Log

It basically reproduces the previous script. All kinds of incomplete file names selected by the mouse of the terminal can be found. When multiple files are found at the same time, silence fails. This option can be turned off.

基本复刻了以前的脚本。终端的鼠标选择的各种残缺文件名都能找到。同时找到多个文件时，会静默失败。此选项能关闭。(回收站里有同名的文件，也会导致失败。)

A context menu is added for more convenient opening of files selected from the terminal.

增加了一个上下文菜单，用于更方便的打开从终端选择的文件。

Copy two Dirs/Files names from anywhere such as `nautilus` or `gnome-terminal`, and then compare them.  Dirs/Files copied to the `CLIPBOARD` can only be used for comparison. Dirs/Files selected to the `PRIMARY` with mouse can be opened by click the menu item.

从 `nautilus`或 `gnome terminal`等任意位置复制两个文件/目录名，然后进行比较。
复制到 `CLIPBOARD`剪贴板的文件/目录，只能用于比较。鼠标选中到 `PRIMARY`的文件，还可以点击菜单打开。

In the terminal, the absolute path and the relative path of the home directory can be recognized. Double click the mouse to select. Suitable for `locate` and `find ~` commands.

在终端中，绝对路径和家目录的相对路径，都能识别。双击鼠标就能选中。适合于 `locate` 和 `find ~` 命令。

In `nautilus`, press ctrl-c or copy in the context-menu.

在 `nautilus`中，按ctrl-c或在上下文菜单，进行复制。

Only one file or directory can be copied each time, otherwise the copy is invalid.

每次只能复制一个文件或目录，否则复制无效。

Meld must be installed.

需要安装了 meld 软件。

Add the hotkey `ctrl-o` to open the last file selected by the mouse. Partly replace the previous script `o`.

增加热键 `Ctrl-O` 打开最后一个鼠标选中的文件。部分代替之前的脚本 `o`。

![](screenshot.png)

```
⭕ tree ~/.local/share/gnome-shell/extensions/compare@eexpss.gmail.com
├── compare-open-symbolic.svg
├── extension.js
├── metadata.json
└── schemas
    ├── gschemas.compiled
    └── org.gnome.shell.extensions.compare.gschema.xml
```
