# Obfuscation Instincts

The `Obfuz.ObfuscationInstincts` class provides special functions to obtain obfuscation-related metadata information.

## Instinct Functions

|Function Name|Description|
|-|-|
|FullNameOf|Returns the reflection full name of a type before obfuscation, equivalent to the return value of `typeof(T).FullName` before obfuscation. For example, `ObfuscationInstincts.FullNameOf<cfg.Item>()` returns `cfg.Item`|
|NameOf|Returns the reflection name of a type before obfuscation, equivalent to the return value of `typeof(T).Name` before obfuscation. For example, `ObfuscationInstincts.NameOf<cfg.Item>()` returns `Item`|

The generic parameters of Instinct functions do not support **uninstantiated** generic parameters, such as:

```csharp

class A
{

}

class TestInstinct
{

    public static string GetNameBeforeObfuscation<T>()
    {
        return ObfuscationInstincts.NameOf<T>();
    }

    public static void Test()
    {
        // Correct usage
        // s1 value is A
        var s1 = ObfuscationInstincts.NameOf<A>();
        
        // Correct usage
        // s2 value is List`1
        var s2 = ObfuscationInstincts.NameOf<List<int>>();

        // Incorrect usage
        // s3 value equals T, not A
        var s3 = GetNameBeforeObfuscation<A>();
    }
}


```

## Implementation Principle

In the early stages of obfuscation, Obfuz scans for Instinct functions appearing in the code and replaces them with appropriate values or code.

For example, Obfuz scans all method bodies. If a function call like `ObfuscationInstincts.NameOf<YourClass>()` appears, it removes the function call and replaces it with an `ldstr "YourClass"` instruction.
