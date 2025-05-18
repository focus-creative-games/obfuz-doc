# Obfuscation Pass

Obfuz支持多种混淆算法，混淆时会按照某个顺序依次执行每个混淆算法，最终输出混淆后的程序集。由于这些混淆算法是一趟趟执行的，我们称之为**Obfuscation Pass**。

## 支持的Pass

目前已经支持的Obfuscation Pass有：

- Symbol Obfuscation（符号混淆）
- Const Encryption（常量加密）
- Field Encryption（字段加密）
- Call Obfusaction（函数调用混淆）
- CleanUp Pass。没有任何混淆操作，只执行一些清理操作（如优化冗余代码等）。
- RemoveObfuzAttributesPass。 最后一个Pass，移除最终的代码中用不到的`[ObfuzIgnore]`特性。

后续将会支持的Obfuscation Pass有：

- Expression Obfusaction（表达式混淆）
- ControlFlow Obfuscation（控制流混淆）
- 加水印
- Anti-Debugger、Anti-Damper、Anti-Dumping

## 设置

`ObfuzSettings.ObfuscationPassSettings`中包含了Pass相关设置。

- `EnabledPass`设置了全局启用的Pass的组合。**没有被启用的Pass即使在规则文件中设置了，也会被忽略**。
- `RuleFiles` 包含规则文件列表。这些规则文件的路径相对Unity项目的根目录，如`Assets/Obfuz/pass.xml`。

如果没有在RuleFiles中配置任何规则文件，则默认对所有混淆程序集、类型、字段、函数、Property、event执行`EnabledPasses`中启用的所有Pass。

Obfuz已经考虑到Unity的特殊性，对于无法被混淆的情形（如不能对MonoBehaviour的类型名及Awake之类的事件函数及序列化字段混淆名称）已经默认自动禁用混淆。一般来说不需要特殊设置。

## 规则文件

规则文件格式如下：

- 顶层tag必须为`obfuz`
- 次层tag必须为`assembly`，可以有多个。name属性必须为被混淆的程序集，即必须在`AssemblySettings.AssemblyToObfuscate`出现。不允许重复出现同名assemly规则，
即为每个混淆程序集最多指定一个assembly规则。如果没有为某个被混淆程序集配置assembly规则，则使用`EnabledPass`中启用的所有Pass。
- assembly中只能配置type规则
- type中只能配置field、method、event、property规则。属性name可选，如果未配置则表示对assembly中所有类型生效，如果配置，则可以是通配字符串表达式（注意！不是正则表达式）。
- field为叶节点规则，无法嵌套子规则。属性name为空时匹配所有，非空时为通配字符串表达式。
- method为叶节点规则，无法嵌套子规则。属性name为空时匹配所有，非空时为通配字符串表达式。
- property为叶节点规则，无法嵌套子规则。属性name为空时匹配所有，非空时为通配字符串表达式。
- event为叶节点规则，无法嵌套子规则。属性name为空时匹配所有，非空时为通配字符串表达式。
- assembly、type、field、method、property、event 都可以通过enable和disable属性指定启用或者禁用的Obfuscation Pass。

示例如下：

```xml
<obfuz>
    
    <assembly name="Obfus1" enable="SymbolObfus">
      <type name="TestSetEnablePass1" enable="ConstEncrypt">
        <field name="xxx" enable="ConstEncrypt|FieldEncrypt"/>
        <field name="*abc" enable="+ConstEncrypt"/>
        <method name="Get*" disable="ConstEncrypt"/>
        <property name="Value*" disable="+SymbolObfus|FieldEncrypt"/>
      <type>
      <type name="*.TestAddEnablePass1" enable="+ConstEncrypt">
        <field name="yyy" enable="ConstEncrypt|FieldEncrypt"/>
      </type>
    </assembly>

    <assembly name="Obfus2" enable="SymbolObfus">
      <type enable="ConstEncrypt">
        <field name="xxx" enable="ConstEncrypt|FieldEncrypt"/>
        <field name="*abc" enable="+ConstEncrypt"/>
      <type>
    </assembly>
</obfuz>

```

### enable与disable

enable与disable属性用于设置当前规则中开启或者禁用哪些Pass。

配置格式为正则表达式`"\+?(SymbolObfus|ConstEncrypt|FieldEncrypt|CallObfus)+"`。

- 如果值以`+`开关，则表示是在父节点上启用的pass上进行增量修改。
- 如果没有以`+`开启，则表示在`ObfuscationPassSettings.EnabledPasses`的值的基础上启用或者禁用某些Pass。

例如，假设EnabledPass=`SymbolObfus|ConstEncrypt|FieldEncrypt`，使用以下配置。

```xml
    <assembly name="Obfus2" enable="SymbolObfus">
      <type name="Hello" enable="+ConstEncrypt">
        <field name="xxx" enable="FieldEncrypt"/>
        <field name="abc" disable="+ConstEncrypt"/>
        <field name="edf" disable="ConstEncrypt"/>
        <field name="aaa" enable="+FieldEncrypt|CallObfus" disable="+ConstEncrypt|SymbolObfus"/>
      <type>
    </assembly>
```

则最终效果为：

- 对程序集Obfus2及它的所有子类型及成员元数据默认只开启SymbolObfus
- 类型Hello在父节点Obfus2的启用的Pass的基础上增加了`ConstEncrypt` Pass，最终Pass为`SymbolObfus|ConstEncrypt`。
- 字段xxx只启用了`FieldEncrypt` Pass
- 字段abc在父节点基础上禁用了`ConstEncrypt` Pass，它的最终Pass为`SymbolObfus`。
- 字段edf在`EnabledPasses`基础上禁用了`ConstEncrypt` Pass，它的最终Pass为 `SymbolObfus|FieldEncrypt|CallObfus`
- 字段aaa在父节点基础上增加了`FieldEncrypt|CallObfus`，禁用了`ConstEncrypt|SymbolObfus`,它的最终Pass为`FieldEncrypt|CallObfus`

## ObfuzIgnoreAttribute

如果只是对少量类型、字段、函数禁用混淆，直接在代码中添加`[ObfuzIgnore]`可能是更便捷的做法。

`[ObfuzIgnore]`可以添加到类型、函数、字段、Property、event上，被添加的元数据会被禁用所有混淆操作。

|[ObfuzIgnore]添加的目标|描述|
|-|-|
|类型|该类型及所有内嵌子类型、成员字段、函数、Property、event都不会被混淆|
|函数|该函数名及参数及函数体都不会被混淆。注意！函数代码中引用的符号如果被混淆或者加密，则仍然会被替换为混淆后的版本。显然必须这么做才能保证正确性。|
|字段|会被禁用符号混淆、字段加密在内的所有可作用于字段的混淆操作|
|Property|会被禁用符号混淆在内的所有可作用于Property的混淆操作|
|event|会被禁用符号混淆在内的所有可作用于event的混淆操作|

`[ObfuzIgnore]`会在最后的RemoveObfuzAttributesPass中被移除，因此它只会出现在源码和原始程序集中，不会出现在最终的混淆后的程序集中。
