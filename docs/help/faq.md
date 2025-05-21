# 常见问题

## exception:The type initializer for '$$Obfuz$RVA$' threw an exception., stack:  at $CSharpUtility.$createInstance[T] (System.Type 1, System.Object[] 1)

还未初始化`EncrytionService<T>::Encryptor`就运行的混淆代码。解决办法为先初始化`EncryptionService<T>::Encryptor`，代码如下：

```csharp

    [ObfuzIgnore]
    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterAssembliesLoaded)]
    private static void SetUpStaticSecret()
    {
        EncryptionService<DefaultStaticEncryptionScope>.Encryptor = new GeneratedEncryptionVirtualMachine(Resources.Load<TextAsset>("Obfuz/defaultStaticSecretKey").bytes);
        // 设置其他静态EncryptionScope的Encryptor
        // ...
    }

    // 一般来说DynamicSecret在热更新完成后才设置。
    // 请在执行热更新代码之前运行以下代码。
    private static void SetUpDynamicSecret()
    {
        EncryptionService<DefaultDynamicEncryptionScope>.Encryptor = new GeneratedEncryptionVirtualMachine(Resources.Load<TextAsset>("Obfuz/defaultDynamicSecretKey").bytes);
        // 设置其他动态EncryptionScope的Encryptor
        // ...
    }
```
