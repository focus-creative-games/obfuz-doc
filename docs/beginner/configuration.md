# 自定义混淆规则

本示例演示如何配置混淆规则文件，完整示例项目参见[CustomConfigure](https://github.com/focus-creative-games/obfuz/tree/main/Samples/CustomConfigure)。

## 修改EncryptionVM相关设置

打开`ObfuzSettings`设置窗口，找到`EncryptionVMSettings`项。

- 修改CodeGenerationSecretKey字段为自定义值

## 修改Secret相关设置

`ObfuzSettings`窗口中找到`SecretSettings`项。

- 修改DefaultStaticSecretKey字段为自定义值
- 修改DefaultDynamicSecretKey字段为自定义值
- 修改RandomSeed字段为自定义的int整数

## 修改符号混淆相关设置

在`Assets/Obfuz`目录下创建`symbol-obfuscation.xml`文件，同时`SymbolObfusSettings.RuleFiles`中新增一项`Assets/Obfuz/symbol-obfuscation.xml`。

文件内容如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>

<obfuz>
    <assembly name="Assembly-CSharp">
      <type name="SymbolObfus.Test1" obName="0"/> 不混淆Test1类自身及它的所有成员，包括嵌套类
    </assembly>
</obfuz>
```

## 修改常量加密相关设置

在`Assets/Obfuz`目录下创建`const-encrypt.xml`文件，同时`ConstEncryptSettings.RuleFiles`中新增一项`Assets/Obfuz/const-encrypt.xml`。内容如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>

<obfuz>

    <whitelist type="int">-100,100</whitelist> 不加密 [-100, 100]范围内的常量
    <whitelist type="string-length-range">,3</whitelist> 不加密长度小于等于3的字符串
    
    <assembly name="Assembly-CSharp">
        <type name="ConstEncrypt.Test1" disableEncrypt="1"/> 对Test1类所有函数禁用常量加密
        <type name="ConstEncrypt.Test2">
            <method name="Sum3" disableEncrypt="1"/> 不加密Sum3函数中的常量
        </type>
    </assembly>
</obfuz>
```

## 修改字段加密相关设置

在`Assets/Obfuz`目录下创建`field-encrypt.xml`文件，同时`FieldEncryptSettings.RuleFiles`中新增一项`Assets/Obfuz/field-encrypt.xml`。内容如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>

<obfuz>
    <assembly name="Assembly-CSharp">
        <type name="FieldEncrypt.Test1">
            <field name="a" encrypt="1"/>
        </type>
    </assembly>
</obfuz>
```

## 修改调用混淆相关设置

在`Assets/Obfuz`目录下创建`call-obfuscation.xml`文件，同时`CallObfusSettings.RuleFiles`中新增一项`Assets/Obfuz/call-obfuscation.xml`。内容如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>

<obfuz>
  <whitelist>
    <assembly name="mscorlib" obfuscate="0"/>
    <assembly name="UnityEngine.*" obfuscate="0"/>
  </whitelist>
  
  <assembly name="Assembly-CSharp">
      <type name="*CallObfus.Test1" disableObfuscation="1"/>
      <type name="*CallObfus.Test2">
          <method name="Run1" disableObfuscation="1"/>
      </type>
  </assembly>
</obfuz>
```

## 生成加密虚拟机及密钥

- 运行菜单`Obfuz/GenerateEncryptionVM`生成加密虚拟机代码，默认生成的代码文件为`Assets/Obfuz/GeneratedEncryptionVirtualMachine.cs`。
- 运行菜单`Obfuz/GenerateSecretKeyFile`生成两个密钥文件。默认输出文件为`Assets/Resources/Obfuz/defaultStaticSecretKey.bytes`和`Assets/Resources/Obfuz/defaultDynamicSecretKey.bytes`

## 添加测试代码

文件比较多，请直接参考[CustomConfigure](https://github.com/focus-creative-games/obfuz/tree/main/Samples/CustomConfigure)。

## 构建&运行

`Player Settings`窗口点击`Build And Run`即可。

## 查看混淆后Assembly-CSharp代码

使用[ILSpy](https://github.com/icsharpcode/ILSpy)打开`Library/Obfuz/{buildTarget}/ObfuscatedAssemblies/Assembly-CSharp.dll`。
