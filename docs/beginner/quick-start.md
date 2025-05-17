# 快速上手

:::tip
Obfuz支持Unity 2019+版本，同时也支持团结引擎1.0.0+，能在所有Unity和团结引擎支持的平台下正确工作。
:::

本文档将指引从零开始创建一个Obfuz示例项目。完整示例项目参见[Obfuz](https://github.com/focus-creative-games/obfuz/tree/main/Obfuz).

## 创建项目

创建一个空的Unity项目。创建一个main场景，并且将它添加到`Build Settings`窗口中的场景列表中。

## 安装

打开Unity Package Manager窗口，点击`Add package from URL...`，填入地址`https://github.com/focus-creative-games/obfuz.git?path=Obfuz/Packages/com.code-philosophy.obfuz`
即可完成安装。

## 配置

出于简单起见，我们将默认程序集`Assembly-CSharp`配置为需要混淆的程序集。

打开`Obfuz/Settings...`菜单，展开`Assembly Settings`项，在配置项`Assemblies To Obfuscate`中新增一项`Assembly-CSharp`。

## 生成加密虚拟机及密钥

- 运行菜单`Obfuz/GenerateEncryptionVM`生成加密虚拟机代码，默认生成的代码文件为`Assets/Obfuz/GeneratedEncryptionVirtualMachine.cs`。
- 运行菜单`Obfuz/GenerateSecretKeyFile`生成两个密钥文件。默认输出文件为`Assets/Resources/Obfuz/defaultStaticSecretKey.bytes`和`Assets/Resources/Obfuz/defaultDynamicSecretKey.bytes`

## 添加代码

- 创建`Assets/Scripts`脚本目录。
- 在`Assets/Scripts`目录创建 `Algorithm.cs`代码文件，文件内容如下：

```csharp

using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Algorithm
{
    public int Add(int a, int b)
    {
        return a + b;
    }

    public int ComputeHashCode(int a)
    {
        int hash = 17;
        hash = hash * 23 + a.GetHashCode();
        return hash;
    }
}

```

- 在`Assets/Scripts`目录下创建`Bootstrap.cs`代码文件，文件内容如下：

```csharp
using Obfuz;
using Obfuz.EncryptionVM;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;


public class Bootstrap : MonoBehaviour
{
    // [ObfuzIgnore]指示Obfuz不要混淆这个函数。
    // 需要初始化Obfuz加密虚拟机后被混淆的代码才能正常运行。
    // 尽可能地早地初始化这个加密虚拟机。
    [ObfuzIgnore]
    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterAssembliesLoaded)]
    private static void SetUpStaticSecret()
    {
        Debug.Log("SetUpStaticSecret begin");
        EncryptionService<DefaultStaticEncryptionScope>.Encryptor = new GeneratedEncryptionVirtualMachine(Resources.Load<TextAsset>("Obfuz/defaultStaticSecretKey").bytes);
        Debug.Log("SetUpStaticSecret end");
    }

    // Start is called before the first frame update
    void Start()
    {
        var c = new Algorithm();
        int a = c.Add(100, 200);
        Debug.Log($"a = {a}");

        int b = c.ComputeHashCode(a);
        Debug.Log($"b = {b}");
    }
}

```

## 挂载脚本

在场景中创建一个GameObject，然后将`BootStrap`脚本加到这个GameObject上。

在Unity Editor中试运行，确保没有错误。

## 构建&运行

在`Build Settings`中运行`Build And Run`构建并且运行。Obfuz会在构建过程插入对Assembly-CSharp的混淆操作，
原始文件备份到`Library/Obfuz/{buildTarget}/OriginalAssemblies、Assembly-CSharp.dll`，
混淆后的文件备份到`Library/Obfuz/{buildTarget}/ObfuscatedAssemblies/Assembly-CSharp.dll`。

查看Player.log，验证运行日志与Editor下运行结果一致。

## 查看混淆后的Assembly-CSharp程序集

使用[ILSpy](https://github.com/icsharpcode/ILSpy)打开`Library/Obfuz/{buildTarget}/ObfuscatedAssemblies/Assembly-CSharp.dll`。
发现确实被混淆了。

混淆后的Boostrap类代码变成如下:

```csharp

using System;
using $a;
using $A;
using UnityEngine;

// Token: 0x02000003 RID: 3
public class Bootstrap : MonoBehaviour
{
  // Token: 0x06000004 RID: 4 RVA: 0x0000313D File Offset: 0x0000133D
  [RuntimeInitializeOnLoadMethod(2)]
  private static void SetUpStaticSecret()
  {
    Debug.Log("SetUpStaticSecret begin");
    global::$A.$C<$c>.$L = new global::$a.$A(Resources.Load<TextAsset>("Obfuz/defaultStaticSecret").bytes);
    Debug.Log("SetUpStaticSecret end");
  }

  // Token: 0x06000005 RID: 5 RVA: 0x000032E0 File Offset: 0x000014E0
  private void Start()
  {
    global::$a $a = new global::$a();
    int num = global::$e.$A($a, global::$e.$a(global::$d.$A, 8, 117, -2060908889, global::$A.$C<$c>.$d(-1139589574, 85, -452785586)), global::$e.$a(global::$d.$A, 12, 138, -1222258517, global::$A.$C<$c>.$d(-1139589574, 85, -452785586)), global::$A.$C<$c>.$d(-595938299, 185, 132898840));
    global::$e.$b(string.Format(global::$D.$a, num), global::$A.$C<$c>.$d(1718597184, 154, 2114032877));
    int num2 = global::$e.$B($a, num, global::$A.$C<$c>.$d(368894728, 171, -1414000938));
    global::$e.$b(string.Format(global::$D.$A, num2), global::$A.$C<$c>.$d(1718597184, 154, 2114032877));
  }
}

```
