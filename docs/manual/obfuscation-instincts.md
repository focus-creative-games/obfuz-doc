# ObfuscationInstincts

`Obfuz.ObfuscationInstincts`类提供一些特殊函数，可以获得混淆相关的元数据信息。

## Instinct 函数

|函数名|描述|
|-|-|
|FullNameOf|返回某个类型混淆前的反射全名，即等价于混淆前`typeof(T).FullName`的返回值。如`ObfuscationInstincts.FullNameOf<cfg.Item>()`返回`cfg.Item`|
|NameOf|返回某个类型混淆前的反射名，即等价于混淆前`typeof(T).Name`的返回值。如`ObfuscationInstincts.FullNameOf<cfg.Item>()`返回`Item`|

Instinct函数的泛型参数不支持**未实例化**的泛型参数，如：

```csharp

class A
{

}

class TestInstinct
{

    public static string GetNameBeforeObfusaction<T>()
    {
        return ObfuscationInstincts.NameOf<T>();
    }

    public static void Test()
    {
        // 正确用法
        // s1的值为 A
        var s1 = ObfuscationInstincts.NameOf<A>();
        
        // 正确用法
        // s2的值为 List`1
        var s2 = ObfuscationInstincts.NameOf<List<int>>();

        // 错误用法
        // s3 的值等于T，而不会是A
        var s3 = GetNameBeforeObfusaction<A>();
    }
}


```

## 实现原理

在混淆的早期阶段，Obfuz会扫描代码中出现的Instinct函数，将它替换为合适的值或者代码。

例如，Obfuz扫描所有函数体，如果出现`ObfuscationInstincts.NameOf<YourClass>()`这样的函数调用，则移除该函数调用，替换为`ldstr "YourClass"`指令。
