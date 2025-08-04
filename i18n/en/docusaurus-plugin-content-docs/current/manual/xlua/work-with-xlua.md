# Working with XLua

Obfuz can work well with xLua, but requires minor adjustments to xLua and additional registration code execution.

## Compatibility Issues

When xLua registers C# types, it doesn't directly use type name strings but calls Type.FullName, which causes the C# type names registered in lua code after obfuscation to actually be obfuscated names. Attempting to access C# classes with original names will result in `type not found` errors!

A more thorough approach is to adjust the xlua implementation to use type name constant strings during registration. However, this approach requires significant changes because many xlua internal functions have `Type` type parameters and call code like `Type.FullName` or `Type.Namespace` within the functions,
and the original type names cannot be known at these call sites.

We adopted a simpler solution: using Obfuz's provided `ObfuscationTypeMapper` to get the original type name corresponding to Type, and modifying all code in xLua source that calls `Type.FullName`
to use `ObfuscationTypeMapper.GetOriginalTypeFullNameOrCurrent(type)` instead.

Nearly ten places were modified in total. We won't list them all here. Please diff the code between [WorkWithLua](https://github.com/focus-creative-games/obfuz-samples/tree/main/WorkWithXLua) and [xLua](https://github.com/Tencent/xLua/tree/master).

## Register Type Mappings

For ObfuscationTypeMapper to work correctly, it requires pre-registration of the mapping relationship between Type and original type full names. Theoretically, you can write code like `ObfuscationTypeMapper.RegisterType<My.TestClass>("My.TestClass")`,
but obviously, if there are many types to register, it's very easy to make mistakes. Additionally, with type name refactoring, you might forget to synchronously modify the code here.

Fortunately, `ObfuscationInstincts::RegisterReflectionType` provides a very convenient registration method. You can use `ObfuscationInstincts::RegisterReflectionType<My.TestClass>()`
to correctly register the mapping relationship between type names and original names. There's some black magic involved here. For specific principles, see [ObfuscationInstincts](../obfuscation-instincts).

:::warning

Please register all type mappings before creating LuaEnv instances.

:::

## TODO

In the future, Obfuz may further simplify the complexity of working with xLua.
