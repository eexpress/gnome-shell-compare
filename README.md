# gnome-shell-compare

[<img alt="" height="80" src="https://raw.githubusercontent.com/andyholmes/gnome-shell-extensions-badge/master/get-it-on-ego.svg?sanitize=true">](https://extensions.gnome.org/extension/4789/compare-filedir-from-clip/)

---

## Function introduction 功能介绍

- File from CLIPBOARD: Only used for comparison. Usually copied in the file manager.
- 剪贴板中的文件：仅用于比较。通常是在文件管理器中复制的。
- File from PRIMARY: Can be used for comparison, can be clicked to open in menu, AND will create context menu. Usually selected with the mouse at the terminal.
- 选择缓存中的文件：可用于比较，可以点击菜单项目打开，并将创建上下文菜单。通常是在终端中用鼠标选择的。
- Ctrl-O hotkey: Open last file.
- Ctrl-O热键：打开最后一个文件。

## Menu item introduction 菜单项目介绍

▶ Auto pop menu:  When a file is detected, the menu opens automatically. If unchecked, it will enter the lazy mode, and the last selected or copied text will not be processed until the menu is opened manually.

▶ 自动弹出菜单：当检测到文件时，菜单会自动打开。如果取消选中，将进入延迟模式，则手动打开菜单后，才会处理最后选定或复制的文本。

▶ CLIPBOARD act as PRIMARY: File from CLIPBOARD will be treated as file from PRIMARY.

▶ 把剪贴板当成选择缓存：剪贴板中的文件将被视为选择缓存中的文件对待。

▶ Strong find file using locate: For a file that is not a full path, `locate` will be used to perform a strong search until the only identified file is found. (Files in Trash will interfere with the unique search)

▶ 使用locate强力查找文件：对于非完整路径的文件，将使用`locate`进行强力搜索，以便找到唯一确定的文件。（回收站的内容会干扰唯一性）

▶ Compare two Dirs/Files below: When two files or directories are of the same mime-type, you can click the menu to compare them with `meld`.

▶ 比较文件或目录：当两个文件或目录类型相同时，可以单击菜单调用`meld`进行比较。。

## Change Log

It basically reproduces the previous script. All kinds of incomplete file names selected by the mouse of the terminal can be found. When multiple files are found at the same time, silence fails. This option can be turned off.

基本复刻了以前的脚本。终端的鼠标选择的各种残缺文件名都能找到。同时找到多个文件时，会静默失败。此选项能关闭。(回收站里有同名的文件，也会导致失败。)

In the terminal, the absolute path and the relative path of the home directory can be recognized. Double click the mouse to select. Suitable for `locate` and `find ~` commands.

在终端中，绝对路径和家目录的相对路径，都能识别。双击鼠标就能选中。适合于 `locate` 和 `find ~` 命令。

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
