# 加密

加密是Obfuz的核心机制，绝大多数Obfuscation Pass都跟加密有关，原因如下：

- 常量加密之类的直接涉及到数据加密功能必然要用到加密相关机制
- 函数调用混淆之类的混淆Pass会利用延迟（即第一次执行到该代码时）解密一些关键参数来阻止离线破解

## IEncryptor

Obfuz在一个IEncryptor基础加密接口上构建了整个加密机制。

```csharp

namespace Obfuz
{
    public interface IEncryptor
    {
        int OpCodeCount { get; }

        void EncryptBlock(byte[] data, int ops, int salt);
        void DecryptBlock(byte[] data, int ops, int salt);

        int Encrypt(int value, int opts, int salt);
        int Decrypt(int value, int opts, int salt);

        long Encrypt(long value, int opts, int salt);
        long Decrypt(long value, int opts, int salt);

        float Encrypt(float value, int opts, int salt);
        float Decrypt(float value, int opts, int salt);

        double Encrypt(double value, int opts, int salt);
        double Decrypt(double value, int opts, int salt);

        byte[] Encrypt(byte[] value, int offset, int length, int opts, int salt);
        byte[] Decrypt(byte[] value, int offset, int byteLength, int ops, int salt);

        byte[] Encrypt(string value, int ops, int salt);
        string DecryptString(byte[] value, int offset, int stringBytesLength, int ops, int salt);
    }
}


```

任何一个加密或者解密操作都涉及到3个数据：

- data 原始数据或者加密后的数据
- ops 加密或者解密操作
- salt 额外的随机参数

## 加密指令组 ops

加了增加破解难度，Obfuz不使用固定的加密代码，而是提前生成好固定的MaxOpCount个（默认256个，可自定义配置）加密指令。
对每个加密对象都生成一组的随机加密（或解密）指令 op1、op2、 .. opn。

为了简化实现同时避免过度影响性能，我们限制了加密操作不超过4个，它们一般可以编码为一个整数，即Encrypt或Decrypt函数中的`int ops`参数。

最终ops的计算方式如以下代码：

```csharp

int GenerateOps(uint[] opArr)
{
  uint ops = 0;
  for (int i = opArr.Length - 1; i >= 0; i--)
  {
    ops *= MaxOpCount;
    ops |= opArr[i];
  }
  return (int)ops;
}

```

由于解密是加密的逆序操作，使用逆序编码ops的算法方便运行时解密时以正序解码ops，提高运行效率，毕竟运行时解密的操作比加密操作要多得多。

## EncryptionVM

EncryptionVM实现了IEncryptor接口，同时实现了MaxOpCount个加密和解密指令。为了增加破解难度，我们希望加密操作不是固定的，每个开发者都能用一套独立的加密算法。
而EncryptionVM是通过一个`Code Generation Secret Key`使用某种确定性的随机算法生成。只要每个开发者使用不同的`Generation Key`，就可以确保每个开发者的加密
算法会完全不同。

详细文档见[EncryptionVM](./encryptionvm)。

## EncryptionService

Obfuz通过EncryptionSerivce类提供统一的加密和解密服务。它的实现很简单，有一个`IEncryptor _encryptor`变量，通过转发调用`_encryptor`中的接口函数实现具体的加解密服务。

截取EncryptionService的部分代码如下：

```csharp


namespace Obfuz
{

    public static class EncryptionService<T> where T : IEncryptionScope
    {
        // for compatibility with Mono because Mono will raise FieldAccessException when try access private field
        public static IEncryptor _encryptor;

        public static IEncryptor Encryptor
        {
            get => _encryptor;
            set { _encryptor = value; }
        }

        public static void EncryptBlock(byte[] data, int ops, int salt)
        {
            _encryptor.EncryptBlock(data, ops, salt);
        }

        public static void DecryptBlock(byte[] data, int ops, int salt)
        {
            _encryptor.DecryptBlock(data, ops, salt);
        }

        // ....
    }
}

```

以常量加密为例， `int a = 5;` 经过常量加密后变成 `int a = Obfuz.EncryptionService<Obfuz.DefaultStaticSecretScope>.Decrypt(11231312, 98978274, 2342342)`。

### 初始化Encryptor

一般会给EncryptionService.Encryptor赋值`GeneratedEncryptionVirtualMachine`实例，示例代码如下。

```csharp

    [ObfuzIgnore]
    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterAssembliesLoaded)]
    private static void SetUpStaticSecret()
    {
        EncryptionService<DefaultStaticEncryptionScope>.Encryptor = new GeneratedEncryptionVirtualMachine(Resources.Load<TextAsset>("Obfuz/defaultStaticSecretKey").bytes);
        // ... 初始化其他EncryptionScope
    }

```

GeneratedEncryptionVirtualMachine需要一个长度1024的`byte[]`密钥参数。由于这个密钥比较长，没有选择直接生成，而是基于一个起始密钥字符串，通过哈希算法计算出最终的密钥。

Obfuz调用`Obfuz.Utils.KeyGenerator::GenerateKey`函数来生成密钥，代码如下：

```csharp
namespace Obfuz.Utils
{
    public static class KeyGenerator
    {
        public static byte[] GenerateKey(string initialString, int keyLength)
        {
            byte[] initialBytes = Encoding.UTF8.GetBytes(initialString);
            using (var sha512 = SHA512.Create())
            {
                byte[] hash = sha512.ComputeHash(initialBytes);
                byte[] key = new byte[keyLength];
                int bytesCopied = 0;
                while (bytesCopied < key.Length)
                {
                    if (bytesCopied > 0)
                    {
                        // 再次哈希之前的哈希值以生成更多数据
                        hash = sha512.ComputeHash(hash);
                    }
                    int bytesToCopy = Math.Min(hash.Length, key.Length - bytesCopied);
                    Buffer.BlockCopy(hash, 0, key, bytesCopied, bytesToCopy);
                    bytesCopied += bytesToCopy;
                }
                return key;
            }
        }

        // ...
    }
}

```

## EncryptionScope

游戏项目为了增加破解难度，希望使用多个密钥。又如项目中使用了代码热更新，很有可能希望热更新代码使用的加密密钥和AOT中的不一样，并且希望这个密钥可以热更新完成后再加载，而不是必须启动时就加载。
Obfuz通过EncryptionScope来实现这个功能。

通过运行时为不同的`EncryptionService<{EncryptionScope}>`设置不同的`IEncryptor`实例，可以实现使用多个不同的密钥，示例代码如下：

```csharp

    [ObfuzIgnore]
    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterAssembliesLoaded)]
    private static void SetUpStaticSecret()
    {
        EncryptionService<DefaultStaticEncryptionScope>.Encryptor = new GeneratedEncryptionVirtualMachine(Resources.Load<TextAsset>("Obfuz/defaultStaticSecretKey").bytes);
        // 设置其他静态EncryptionScope的Encryptor
        // ...
    }

    private static void SetUpDynamicSecret()
    {
        EncryptionService<DefaultDynamicEncryptionScope>.Encryptor = new GeneratedEncryptionVirtualMachine(Resources.Load<TextAsset>("Obfuz/defaultDynamicSecretKey").bytes);
        // 设置其他动态EncryptionScope的Encryptor
        // ...
    }
```

每个程序集只能对应一个EncryptionScope，即你无法为一个程序集中的部分代码使用EncryptionScopeA，为另一个部分代码使用EncryptionScopeB。每个被混淆的程序集默认使用`DefaultStaticEncryptionScope`，
即使用`SecretSettings.DefaultStaticSecretKey`密钥。如果将某个程序集名添加到`SecretSettings.AssembliesUseDynamicSecretKeys`列表，则这种程序集使用`DefaultDynamicEncryptionScope`。

:::warning

`EncryptionService<DefaultStaticEncryptionScope>.Encryptor`必须使用DefaultStaticSecretKey初始化，
`EncryptionService<DefaultDynamicEncryptionScope>.Encryptor`必须使用DefaultDynamicSecretKey初始化，
两者不可混用！
:::

## Secret Key

当前版本仅支持两个密钥： defaultStaticSecretKey和defaultDynamicSecretKey，后续版本会支持任何多个密钥。

在`ObfuzSettings.SecretSettings`中可配置`DefaultStaticSecretKey`和`DefaultDynamicSecretKey`。

菜单`Obfuz/GenerateSecretKey`会为这两个密钥生成defaultStaticSecretKey.bytes和defaultDynamicSecretKey.bytes文件。可在`SecretSettings.SecretKeyOutputPath`可以配置密钥文件的输出目录。


如果混淆了某些AOT程序集，由于AOT程序集中的代码在很早期就可能被执行到，如此不能在执行这些程序集中的混淆或者加密代码前就为它们所属的`EncryptionService<{EncryptionScope}>`设置Encryptor，
会产生运行异常。建议是尽可能早执行`EncryptionService<{EncryptionScope}>.Encrypor`的初始化代码。一个比较合理的方式是使用`[RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterAssembliesLoaded)]`
在CLR（il2cpp或mono）运行时加载完所有程序集后就运行EncryptionService的初始化代码。

显然，不应该混淆`SetUpStaticSecret`的代码，因为此时EncryptionService还未初始化，这会陷入无限递归。而`SetUpDynamicSecret`则可以被混淆，因此它一般在满足某些条件后（比如热更新完成后）才被调用。

## salt

Encryt或Decrypt中的salt是一个随机生成的参数，取值范围为`[int.MinValue, int.MaxValue]`。它作为一个额外的参数用于增加加密和解密操作的复杂性。

## SecretSettings.RandomSeed

RandomSeed不直接参与加解密过程，但它被用于生成随机的ops、salt以及其他需要随机化的场合。
