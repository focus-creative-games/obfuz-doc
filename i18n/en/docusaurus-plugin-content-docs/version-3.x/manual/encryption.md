# Encryption

Encryption is the core mechanism of Obfuz. Most Obfuscation Passes are related to encryption for the following reasons:

- Features like constant encryption that directly involve data encryption functionality inevitably need to use encryption-related mechanisms
- Obfuscation passes like function call obfuscation use delayed (i.e., when executing that code for the first time) decryption of some key parameters to prevent offline cracking

## IEncryptor

Obfuz builds the entire encryption mechanism on a basic encryption interface IEncryptor.

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

Any encryption or decryption operation involves 3 pieces of data:

- data: original data or encrypted data
- ops: encryption or decryption operations
- salt: additional random parameter

## Encryption Instruction Group ops

To increase cracking difficulty, Obfuz does not use fixed encryption code, but pre-generates a fixed MaxOpCount number (default 256, customizable) of encryption instructions.
For each encryption object, a set of random encryption (or decryption) instructions op1, op2, .. opn is generated.

To simplify implementation while avoiding excessive performance impact, we limit encryption operations to no more than 4, which can generally be encoded as an integer, i.e., the `int ops` parameter in Encrypt or Decrypt functions.

The final ops calculation method is as follows:

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

Since decryption is the reverse operation of encryption, using reverse encoding ops algorithm facilitates runtime decryption to decode ops in forward order, improving runtime efficiency, as runtime decryption operations are much more frequent than encryption operations.

## EncryptionVM

The encryption service in Obfuz needs to meet the following requirements:

1. Implement all interfaces in IEncryptor.
2. Support encryption instruction group ops mechanism.
3. Polymorphism, i.e., each developer can generate unique encryption code, increasing cracking difficulty.

We achieve these goals by generating EncryptionVM based on a randomization seed.

### Encryption Instruction Set

To support the encryption instruction group ops mechanism, EncryptionVM needs to contain a fixed set of encryption instructions.

EncryptionVM supports the following encryption instruction primitives:

- Add
- Multiple
- Xor
- BitRotate
- AddRotateXor
- AddXorRotate
- MultipleRotateXor
- MultipleXorRotate
- XorAddRotate
- XorMultipleRotate

Each encryption instruction primitive has some randomization parameters, ensuring that every encryption instruction is different.

### Generating Encryption Instruction Set

Obfuz uses a deterministic random algorithm to generate the encryption instruction set based on an initial random seed.

- `EncryptionVMSettings.CodeGenerationSecretKey` configures this initial randomization seed.
- `EncryptionVMSettings.EncryptionOpCodeCount` configures the number of instructions in the encryption instruction set.

EncryptionOpCodeCount must be a power of 2 (like 64, 128, 256, 1024), with a default value of 256. The minimum value is 64, and while there's no maximum limit, it's not recommended to exceed 1024 as it would cause the generated `GeneratedEncryptionVirtualMachine` class code to be too large.

The generation algorithm randomly selects the encryption instruction primitive used by each instruction and the randomization parameters for that encryption primitive.

### Generating EncryptionVM Code

Run the menu `Obfuz/GenerateEncryptionVM` to generate encryption virtual machine code. Configure the output code file path for the `GeneratedEncryptionVirtualMachine` class in `EncryptionVMSettings.CodeOutputPath`.
The default generated code file is `Assets/Obfuz/GeneratedEncryptionVirtualMachine.cs`.

Generally, GeneratedEncryptionVirtualMachine needs to be placed in AOT assemblies. This not only improves encryption performance but also takes advantage of il2cpp's characteristic of compiling code to machine instructions, increasing cracking difficulty.

If there are no AOT obfuscated assemblies, GeneratedEncryptionVirtualMachine can also be placed in hot update assemblies, achieving maximum flexibility with different encryption virtual machines for each hot update code release. However, placing it in hot update code not only leads to poor encryption performance but is also easily reverse-engineered, so this is not recommended.

It's recommended to modify `CodeGenerationSecretKey` each time a new main package is released to generate a brand new EncryptionVM, increasing cracking difficulty. If code hot update technology is used and `GeneratedEncryptionVirtualMachine` is in AOT assemblies, do not modify `CodeGenerationSecretKey` when releasing hot update code, otherwise it will cause decryption code errors in obfuscated hot update assemblies!

## EncryptionService

Obfuz provides unified encryption and decryption services through the EncryptionService class. Its implementation is simple, with an `IEncryptor _encryptor` variable that implements specific encryption and decryption services by forwarding calls to interfaces in `_encryptor`.

Partial code excerpt from EncryptionService:

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

Taking constant encryption as an example, `int a = 5;` becomes `int a = Obfuz.EncryptionService<Obfuz.DefaultStaticSecretScope>.Decrypt(11231312, 98978274, 2342342)` after constant encryption.

### Initializing Encryptor

Generally, EncryptionService.Encryptor is assigned a `GeneratedEncryptionVirtualMachine` instance, example code as follows:

```csharp

    [ObfuzIgnore]
    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterAssembliesLoaded)]
    private static void SetUpStaticSecret()
    {
        EncryptionService<DefaultStaticEncryptionScope>.Encryptor = new GeneratedEncryptionVirtualMachine(Resources.Load<TextAsset>("Obfuz/defaultStaticSecretKey").bytes);
        // ... Initialize other EncryptionScopes
    }

```

GeneratedEncryptionVirtualMachine requires a 1024-byte `byte[]` key parameter. Since this key is quite long, instead of generating it directly, it's calculated from an initial key string through a hash algorithm.

Obfuz calls the `Obfuz.Utils.KeyGenerator::GenerateKey` function to generate keys, code as follows:

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
                        // Hash the previous hash value again to generate more data
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

Game projects want to use multiple keys to increase cracking difficulty. Also, if code hot updates are used in a project, it's very likely that hot update code should use different encryption keys from AOT, and these keys should be loadable after hot updates are completed, not necessarily at startup.
Obfuz implements this functionality through EncryptionScope.

By setting different `IEncryptor` instances for different `EncryptionService<{EncryptionScope}>` at runtime, multiple different keys can be used, example code as follows:

```csharp

    [ObfuzIgnore]
    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterAssembliesLoaded)]
    private static void SetUpStaticSecret()
    {
        EncryptionService<DefaultStaticEncryptionScope>.Encryptor = new GeneratedEncryptionVirtualMachine(Resources.Load<TextAsset>("Obfuz/defaultStaticSecretKey").bytes);
        // Set Encryptors for other static EncryptionScopes
        // ...
    }

    private static void SetUpDynamicSecret()
    {
        EncryptionService<DefaultDynamicEncryptionScope>.Encryptor = new GeneratedEncryptionVirtualMachine(Resources.Load<TextAsset>("Obfuz/defaultDynamicSecretKey").bytes);
        // Set Encryptors for other dynamic EncryptionScopes
        // ...
    }
```

Each assembly can only correspond to one EncryptionScope, i.e., you cannot use EncryptionScopeA for part of the code in an assembly and EncryptionScopeB for another part. Each obfuscated assembly uses `DefaultStaticEncryptionScope` by default,
i.e., uses the `SecretSettings.DefaultStaticSecretKey` key. If an assembly name is added to the `SecretSettings.AssembliesUseDynamicSecretKeys` list, that assembly uses `DefaultDynamicEncryptionScope`.

:::warning

`EncryptionService<DefaultStaticEncryptionScope>.Encryptor` must be initialized with DefaultStaticSecretKey,
`EncryptionService<DefaultDynamicEncryptionScope>.Encryptor` must be initialized with DefaultDynamicSecretKey,
these two cannot be mixed!
:::

## Secret Key

The current version only supports two keys: defaultStaticSecretKey and defaultDynamicSecretKey. Future versions will support any number of keys.

`DefaultStaticSecretKey` and `DefaultDynamicSecretKey` can be configured in `ObfuzSettings.SecretSettings`.

The menu `Obfuz/GenerateSecretKey` will generate defaultStaticSecretKey.bytes and defaultDynamicSecretKey.bytes files for these two keys. The output directory for key files can be configured in `SecretSettings.SecretKeyOutputPath`.

If some AOT assemblies are obfuscated, since code in AOT assemblies may be executed very early, if Encryptor is not set for their corresponding `EncryptionService<{EncryptionScope}>` before executing obfuscated or encrypted code in these assemblies,
runtime exceptions will occur. It's recommended to execute `EncryptionService<{EncryptionScope}>.Encryptor` initialization code as early as possible. A reasonable approach is to use `[RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterAssembliesLoaded)]`
to run EncryptionService initialization code after CLR (il2cpp or mono) runtime loads all assemblies.

Obviously, `SetUpStaticSecret` code should not be obfuscated, as EncryptionService is not yet initialized at that time, which would lead to infinite recursion. However, `SetUpDynamicSecret` can be obfuscated, so it's generally called only after certain conditions are met (such as after hot updates are completed).

## salt

The salt in Encrypt or Decrypt is a randomly generated parameter with a value range of `[int.MinValue, int.MaxValue]`. It serves as an additional parameter to increase the complexity of encryption and decryption operations.

## SecretSettings.RandomSeed

RandomSeed does not directly participate in the encryption/decryption process, but it's used to generate random ops, salt, and other scenarios requiring randomization.
