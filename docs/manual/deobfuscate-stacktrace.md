# 还原混淆堆栈日志

混淆后代码中输出的日志中的函数堆栈是混淆后的名称，这给跟踪问题带来很大障碍。对照symbol mapping文件（文档见[符号混淆](./symbol-obfuscation)）
记录的原始函数与混淆后函数的映射关系，人工还出原始堆栈的工作非常烦琐。Obfuz提供了`DeobfuscateStackTrace`工具用来自动化还原混淆堆栈。

## DeobfuscateStackTrace工具

DeobfuscateStackTrace是一个基于`.net 8`开发的命令行工具，可以运行在Win、MacOS、Linux等所有.net支持的平台。

源码在仓库根目录下的[DeobfuscateStackTrace](https://github.com/focus-creative-games/obfuz-tools/tree/main/DeobfuscateStackTrace)。
可以自己编译，也可以直接从github release链接[DeobfuscateStackTrace.7z](https://github.com/focus-creative-games/obfuz-tools/releases/download/v1.0.0/DeobfuscateStackTrace.7z)中下载。

使用方式如下：

- `DeobfuscateStackTrace --help` 查看帮助。
- `DeobfuscateStackTrace -m {symbol mapping file} -i {obfuscated log} -o {deobfuscate log}` 命令将混淆后的堆栈日志还原为原始日志。 `-m`的参数是 `ObfuzSettings.SymbolObfusSettings.SymbolMappingFile`指向的的symbol mapping文件， `-i` 的参数是混淆后的日志文件， `-o`是输出的还原堆栈后的日志文件。

示例:

- Windows 下

```bat

DeobfuscateStackTrace -m path/of/symbol-mapping.xml -i obfuscated.log -o deobfuscated.log

```

- MacOS或Linux下

```bash
dotnet DeobfuscateStackTrace.dll -m path/of/symbol-mapping.xml -i obfuscated.log -o deobfuscated.log

```
