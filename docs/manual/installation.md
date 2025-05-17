# 安装

打开Unity Package Manager窗口，点击`Add package from URL...`，填入地址`https://github.com/focus-creative-games/obfuz.git?path=Obfuz/Packages/com.code-philosophy.obfuz`
即可完成安装。

## 解决与HybridCLR兼容问题

Obfuz和HybridCLR插件都包含了dnlib插件。对于Unity 2021及更早版本，当两个package中包含同名插件时会产生错误。
解决办法为将这两个插件之一改为本地安装，即将Obfuz或HybridCLR下载到本地，移除其中包含的dnlib.dll，再放到Packages目录下。

