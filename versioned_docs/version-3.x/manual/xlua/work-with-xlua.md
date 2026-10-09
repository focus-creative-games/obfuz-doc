# 与XLua协同工作

Obfuz可以与xLua良好配合工作，但需要对xLua进行小幅调整，并且额外执行一些注册代码。

## 兼容性问题

xLua注册C#类型时并不是直接使用类型名字符串，而是调用了Type.FullName，这导致混淆后lua代码中注册的C#类型名实际上是混淆后的名称。试图用原始名访问C#类会出现`type not found`的错误！

比较彻底的办法是调整xlua实现，注册时使用类型名常量字符串。但这种改法改动很大，因为很多xlua内部函数有`Type`类型参数，在函数中调用了`Type.FullName`或`Type.Namespace`之类的代码，
而在这些调用位置无法知晓原始类型名。

我们采取了一种比较简单的方案：利用Obfuz提供的`ObfuscationTypeMapper`,获取Type对应的原始类型名，修改xLua源码中所有调用`Type.FullName`的代码，
改为`ObfuscationTypeMapper.GetOriginalTypeFullNameOrCurrent(type)`。

总共修改了近十处，我们在这不一一罗列，请自行diff[WorkWithLua](https://github.com/focus-creative-games/obfuz-samples/tree/main/WorkWithXLua)和[xLua](https://github.com/Tencent/xLua/tree/master)代码。

## 注册类型映射

为了ObfuscationTypeMapper能正确工作，要求提前注册Type和原始类型全名的映射关系。理论上你可以写这样的代码`ObfuscationTypeMapper.RegisterType<My.TestClass>("My.TestClass")`,
但很显然，如果注册类型很多，极容易写错。另外随着类型名重构，也很有可能忘了同步修改这儿的代码。

幸运的是，`ObfuscationInstincts::RegisterReflectionType`提供一种非常便捷的注册方式，你使用`ObfuscationInstincts::RegisterReflectionType<My.TestClass>()`即可
正确注册类型名与原始名的映射关系。这其中有一些黑科技，具体原理见[ObfuscationInstrincts](../obfuscation-instincts)。

:::warning

请在创建LuaEnv实例之前注册所有类型映射。

:::

## TODO

未来Obfuz可能会进一步简化与xLua协同工作的复杂度。
