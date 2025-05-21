# 快速上手

:::tip
Obfuz支持Unity 2019+版本，同时也支持团结引擎1.0.0+，能在所有Unity和团结引擎支持的平台下正确工作。
:::

本文档将指引从零开始创建一个Obfuz示例项目。完整示例项目参见[QuickStart](https://github.com/focus-creative-games/obfuz/tree/main/Samples/QuickStart).

## 创建项目

创建一个空的Unity项目。创建一个main场景，并且将它添加到`Build Settings`窗口中的场景列表中。

## 安装

Obfuz的Unity Package Manager URL安装地址：

- gitee `https://gitee.com/focus-creative-games/obfuz.git?path=com.code-philosophy.obfuz`
- github `https://github.com/focus-creative-games/obfuz.git?path=com.code-philosophy.obfuz`

打开Unity Package Manager窗口，点击`Add package from URL...`，填入以上地址之一即可完成安装。

## 配置

出于简单起见，我们将默认程序集`Assembly-CSharp`配置为需要混淆的程序集。

打开`Obfuz/Settings...`菜单，展开`Assembly Settings`项，在配置项`Assemblies To Obfuscate`中新增一项`Assembly-CSharp`。

## 生成加密虚拟机及密钥

- 运行菜单`Obfuz/GenerateEncryptionVM`生成加密虚拟机代码，默认生成的代码文件为`Assets/Obfuz/GeneratedEncryptionVirtualMachine.cs`。
- 运行菜单`Obfuz/GenerateSecretKeyFile`生成两个密钥文件。默认输出文件为`Assets/Resources/Obfuz/defaultStaticSecretKey.bytes`和`Assets/Resources/Obfuz/defaultDynamicSecretKey.bytes`

## 添加代码

- 在`Assets`目录下创建`Bootstrap.cs`代码文件，文件内容如下：

```csharp
using Obfuz;
using Obfuz.EncryptionVM;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;


public class Bootstrap : MonoBehaviour
{
    // [ObfuzIgnore]指示Obfuz不要混淆这个函数
    // 初始化EncryptionService后被混淆的代码才能正常运行，
    // 因此尽可能地早地初始化它。
    [ObfuzIgnore]
    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterAssembliesLoaded)]
    private static void SetUpStaticSecretKey()
    {
        Debug.Log("SetUpStaticSecret begin");
        EncryptionService<DefaultStaticEncryptionScope>.Encryptor = new GeneratedEncryptionVirtualMachine(Resources.Load<TextAsset>("Obfuz/defaultStaticSecretKey").bytes);
        Debug.Log("SetUpStaticSecret end");
    }

    int Add(int a, int b)
    {
        return a + b + 1;
    }

    // Start is called before the first frame update
    void Start()
    {
        Debug.Log("Hello, Obfuz");
        int a = Add(10, 20);
        Debug.Log($"a = {a}");
    }
}

```

## 挂载脚本

在场景中创建一个GameObject，然后将`Bootstrap`脚本加到这个GameObject上。

在Unity Editor中试运行，确保没有错误。

## 构建&运行

在`Build Settings`中运行`Build And Run`构建并且运行。Obfuz会在构建过程插入对Assembly-CSharp的混淆操作，
原始文件备份到`Library/Obfuz/{buildTarget}/OriginalAssemblies/Assembly-CSharp.dll`，
混淆后的文件备份到`Library/Obfuz/{buildTarget}/ObfuscatedAssemblies/Assembly-CSharp.dll`。

查看Player.log，验证运行日志与Editor下运行结果一致。

## 查看混淆后的Assembly-CSharp程序集

使用[ILSpy](https://github.com/icsharpcode/ILSpy)打开`Library/Obfuz/{buildTarget}/ObfuscatedAssemblies/Assembly-CSharp.dll`,
发现程序集确实被混淆了。

混淆后的Boostrap类代码变成如下:

```csharp

using $a;
using Obfuz;
using UnityEngine;

public class Bootstrap : MonoBehaviour
{
 [RuntimeInitializeOnLoadMethod(/*Could not decode attribute arguments.*/)]
 private static void SetUpStaticSecretKey()
 {
  Debug.Log((object)"SetUpStaticSecret begin");
  EncryptionService<DefaultStaticEncryptionScope>.Encryptor = (IEncryptor)(object)new $A(Resources.Load<TextAsset>("Obfuz/defaultStaticSecretKey").bytes);
  Debug.Log((object)"SetUpStaticSecret end");
 }

 private int $a(int 1, int 1)
 {
  return 1 + 1 + 1;
 }

 private void Start()
 {
  $e.$a((object)$D.$a, EncryptionService<DefaultStaticEncryptionScope>.Decrypt(1718597184, 154, 2114032877));
  int num = $e.$b((object)this, $e.$A((object)$d.$A, 0, 27, -201418147, EncryptionService<DefaultStaticEncryptionScope>.Decrypt(-1139589574, 85, -452785586)), $e.$A((object)$d.$A, 4, 153, -875938825, EncryptionService<DefaultStaticEncryptionScope>.Decrypt(-1139589574, 85, -452785586)), EncryptionService<DefaultStaticEncryptionScope>.Decrypt(1757957431, 242, 760404455));
  $e.$a((object)string.Format($D.$A, num), EncryptionService<DefaultStaticEncryptionScope>.Decrypt(1718597184, 154, 2114032877));
 }
}


```

可以看到尽管没有对BootStrap标记为不混淆，也没有对Awake和Start函数标记为不混淆，Obfuz会自动识别这些特殊的Unity类型和函数，不会混淆它们的名称，但仍然会对函数体进行混淆。

这是Obfuz的强大和便利之处，它与Unity工作流深度集成，尽可能地简化混淆的配置工作。
