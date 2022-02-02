# gnome-shell-compare


Copy two Dirs/Files names from anywhere such as `nautilus` or `gnome-terminal`, and then compare them.  Dirs/Files copied to the `CLIPBOARD` can only be used for comparison. Dirs/Files selected to the `PRIMARY` with mouse can be opened by click the menu item.

从 `nautilus`或 `gnome terminal`等任意位置复制两个文件/目录名，然后进行比较。
复制到 `CLIPBOARD`剪贴板的文件/目录，只能用于比较。鼠标选中到 `PRIMARY`的文件，还可以点击菜单打开。

In the terminal, the absolute path and the relative path of the home directory can be recognized. Double click the mouse to select. Suitable for `locate` and `find ~` commands.

在终端中，绝对路径和家目录的相对路径，都能识别。双击鼠标就能选中。适合于 `locate` 和 `find ~` 命令。

In `nautilus`, press ctrl-c or copy in the context-menu.

在 `nautilus`中，按ctrl-c或在上下文菜单，进行复制。

It needs to be copied twice. Only one file or directory can be copied each time, otherwise the copy is invalid.

需要复制两次。每次只能复制一个文件或目录，否则复制无效。

Meld must be installed.

需要安装了 meld 软件。

Add the hotkey `ctrl-o` to open the last file selected by the mouse. Partly replace the previous script `o`.

增加热键 `Ctrl-O` 打开最后一个鼠标选中的文件。部分代替之前的脚本 `o`。

![](screenshot.png)

```
⭕ tree ~/.local/share/gnome-shell/extensions/compare@eexpss.gmail.com
├── extension.js
└── metadata.json
```
