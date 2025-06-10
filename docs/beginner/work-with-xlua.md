# Obfuz+XLua

本工程演示如何将Obfuz与XLua一起使用，完整示例项目参见[WorkWithXLua](https://github.com/focus-creative-games/obfuz-samples/tree/main/WorkWithXLua)。

详细文档见[与XLua协同工作](../manual/work-with-xlua)。

## 安装

安装以下插件：

- com.code-philosophy.obfuz `https://github.com/focus-creative-games/obfuz.git`
- xlua `https://github.com/Tencent/xLua`

由于xlua并未直接提供单独的package仓库，本示例项目在xLua仓库基础上直接修改而来。

## 创建代码

Assets目录下创建`Bootstrap.cs`类，代码如下：

```csharp
using Obfuz;
using Obfuz.EncryptionVM;
using System.Collections;
using System.Collections.Generic;
using Tutorial;
using UnityEngine;


public class Bootstrap : MonoBehaviour
{
    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterAssembliesLoaded)]
    private static void SetUpStaticSecretKey()
    {
        //Debug.Log("SetUpStaticSecret begin");
        EncryptionService<DefaultStaticEncryptionScope>.Encryptor = new GeneratedEncryptionVirtualMachine(Resources.Load<TextAsset>("Obfuz/defaultStaticSecretKey").bytes);
        //Debug.Log("SetUpStaticSecret end");
    }

    private void Awake()
    {
        ObfuscationInstincts.RegisterReflectionType<BaseClass>();
        ObfuscationInstincts.RegisterReflectionType<DerivedClass>();
        ObfuscationInstincts.RegisterReflectionType<Tutorial.ICalc>();
        ObfuscationInstincts.RegisterReflectionType<DerivedClass.InnerCalc>();
        ObfuscationInstincts.RegisterReflectionType<DerivedClass.TestEnumInner>();
        ObfuscationInstincts.RegisterReflectionType<Tutorial.TestEnum>();
    }

    void Start()
    {
        Debug.Log("Hello, Obfuz");
    }
}
```

## 编辑场景

将`Boostrap`及`Tutorial.LuaCallCs`脚本挂载到场景中。

`Tutorial.LuaCallCs`是xLua仓库中自带的演示脚本，位置在`Assets/XLua/Tutorial/CSharpCallLua`目录。

## 配置

- 将Assembly-CSharp加入`ObfuzSettings.AssembliesToObfuscate`列表

## 生成加密虚拟机及密钥

- 运行菜单`Obfuz/GenerateEncryptionVM`生成加密虚拟机代码，默认生成的代码文件为`Assets/Obfuz/GeneratedEncryptionVirtualMachine.cs`。
- 运行菜单`Obfuz/GenerateSecretKeyFile`生成两个密钥文件。默认输出文件为`Assets/Resources/Obfuz/defaultStaticSecretKey.bytes`和`Assets/Resources/Obfuz/defaultDynamicSecretKey.bytes`

## 注册xLua中访问的类型

xLua注册C#类型时并不是直接使用类型名，而是调用了Type.FullName，这导致混淆后lua代码中访问C#类出现`type not found`的错误！

比较彻底的办法是调整xlua实现，类型名在生成wrapper代码时直接确定，但这种改法比较复杂。我们采取了一种比较简单的方案：利用Obfuz提供的`ObfuscationTypeMapper`,
获取Type对应的原始类型名，修改xLua中所有调用`Type.FullName`的代码，改为`ObfuscationTypeMapper.GetOriginalTypeFullNameOrCurrent`。

为了ObfuscationTypeMapper能正确工作，要求提前注册Type和原始类型全名的映射关系。直接手写类型全名很容易出错，`ObfuscationInstincts::RegisterReflectionType`提供一种非常便捷的注册方式。

我们在Bootstrap.Awake函数中添加了注册代码。

## 打包&运行

在`Build Settings`中运行`Build And Run`构建并且运行，查看player.log验证其确实正确运行。
