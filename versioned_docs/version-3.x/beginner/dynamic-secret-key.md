# 使用动态Secret Key

动态Secret适合那些运行一段时间后才执行其逻辑的模块，常用于热更新程序集，详细文档见[加密](../manual/encryption.md)。

本项目演示如何使用动态Secret。完整示例项目参见[DynamicSecretKey](https://github.com/focus-creative-games/obfuz-samples/tree/main/DynamicSecretKey)。

## 安装

与[快速上手](./quick-start.md)相同。

## 项目设置

- `ObfuzSettings.AssemblySettings`中将Assembly-CSharp及HotUpdate程序集添加到`AssembliesToObfuscate`列表
- `ObfuzSettings.SecretSettings`中为`DefaultStaticScretKey`和`DefaultDynamicSecretKey`设置自定义值
- `ObfuzSettings.SecretSettings`中将`HotUpdate`加入`AssembliesUsingDynamicSecretKey`列表。

## 生成加密虚拟机及密钥

- 运行菜单`Obfuz/GenerateEncryptionVM`生成加密虚拟机代码，默认生成的代码文件为`Assets/Obfuz/GeneratedEncryptionVirtualMachine.cs`。
- 运行菜单`Obfuz/GenerateSecretKeyFile`生成两个密钥文件。默认输出文件为`Assets/Resources/Obfuz/defaultStaticSecretKey.bytes`和`Assets/Resources/Obfuz/defaultDynamicSecretKey.bytes`

## 创建相关程序集及代码

- 创建`HotUpdate`程序集，程序集内只有一个Entry类
- 在Assets目录下创建Bootstrap类

Entry类代码如下：

```csharp

using UnityEngine;

public class Entry : MonoBehaviour
{
    void Start()
    {
        Debug.Log("Entry Start");
    }
}

```

Bootstrap类代码如下：

```csharp
using Obfuz;
using Obfuz.EncryptionVM;
using UnityEngine;


public class Bootstrap : MonoBehaviour
{
    [ObfuzIgnore]
    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterAssembliesLoaded)]
    private static void SetUpStaticSecretKey()
    {
        Debug.Log("SetUpStaticSecret begin");
        EncryptionService<DefaultStaticEncryptionScope>.Encryptor = new GeneratedEncryptionVirtualMachine(Resources.Load<TextAsset>("Obfuz/defaultStaticSecretKey").bytes);
        Debug.Log("SetUpStaticSecret end");
    }

    private static void SetUpDynamicSecret()
    {
        Debug.Log("SetUpDynamicSecret begin");
        EncryptionService<DefaultDynamicEncryptionScope>.Encryptor = new GeneratedEncryptionVirtualMachine(Resources.Load<TextAsset>("Obfuz/defaultDynamicSecretKey").bytes);
        Debug.Log("SetUpDynamicSecret end");
    }


    void Start()
    {
        // 延迟加载，在使用HotUpdate程序集代码前才加载动态密钥。
        // 如果项目用到了热更新，一般来说在热更新完成后，加载
        // 热更新代码前才加载动态密钥。
        SetUpDynamicSecret();
        this.gameObject.AddComponent<Entry>();
    }
}
```

## 挂载脚本

在场景中创建一个GameObject，然后将`Bootstrap`脚本加到这个GameObject上。

在Unity Editor中试运行，确保没有错误。

## 构建&运行

在`Build Settings`中运行`Build And Run`构建并且运行。查看Player.log，验证运行日志与Editor下运行结果一致。

## 查看混淆后的Assembly-CSharp程序集

使用[ILSpy](https://github.com/icsharpcode/ILSpy)打开`Library/Obfuz/{buildTarget}/ObfuscatedAssemblies`下的`Assembly-CSharp.dll`和`HotUpdate.dll`,
发现程序集确实被混淆了。并且`Assembly-CSharp`使用了静态密钥，`HotUpdate`使用了动态密钥。

`Bootstrap`类混淆后的代码反编译后代码如下：

```csharp
using $a;
using $A;
using UnityEngine;

public class Bootstrap : MonoBehaviour
{
    [RuntimeInitializeOnLoadMethod(/*Could not decode attribute arguments.*/)]
    private static void SetUpStaticSecretKey()
    {
        Debug.Log((object)"SetUpStaticSecret begin");
        $A.$C<$A.$c>.$L = new global::$a.$A(Resources.Load<TextAsset>("Obfuz/defaultStaticSecretKey").bytes);
        Debug.Log((object)"SetUpStaticSecret end");
    }

    private static void $a()
    {
        $d.$a($A.$C<$A.$c>.$K(global::$C.$A, 0, 24, 137, 1750859568), $A.$C<$A.$c>.$d(1718597184, 154, 2114032877));
        $A.$C<$A.$B>.$L = new global::$a.$A($d.$b($d.$A($A.$C<$A.$c>.$K(global::$C.$A, 24, 29, 98, -1513390007), $A.$C<$A.$c>.$d(-394605899, 193, -1119998407)), $A.$C<$A.$c>.$d(1579960075, 194, -1028386777)));
        $d.$a($A.$C<$A.$c>.$K(global::$C.$A, 53, 22, 61, -331274448), $A.$C<$A.$c>.$d(1718597184, 154, 2114032877));
    }

    private void Start()
    {
        $d.$B($A.$C<$A.$c>.$d(-1185287704, 255, -1146758192));
        $d.$C($d.$c(this, $A.$C<$A.$c>.$d(694999971, 214, -840892815)), $A.$C<$A.$c>.$d(1262757717, 165, 2108602561));
    }
}
```

`Entry`类混淆后的代码如下：

```csharp
using $A;
using UnityEngine;

public class Entry : MonoBehaviour
{
    private void Start()
    {
        $C.$a($A.$C<$A.$B>.$K($c.$A, 0, 11, 128, -835666756), $A.$C<$A.$B>.$d(1717964360, 44, -2091590008));
    }
}

```
