# 符号混淆

符号指的是程序集元带名字的元数据。符号混淆会将这些符号的名称替换为混淆名，同时修复所有引用了这个符号的元数据，确保引用正确性。

符号混淆支持混淆以下元数据：

- 类型名（含命名空间）
- 字段名
- 函数名
- 函数参数
- Property名
- event 名

## 设置

`ObfuzSettings.SymbolObfusSettings`中包含了混淆相关的设置。详细见[设置](./configuration)。

## symbol mapping文件

为了保证混淆稳定性，使用symbol mapping文件记录了新旧符号之间的映射关系，每次混淆时Obfuz会尽量使用上一次的混淆后的名称，除非意外遇到名称冲突。

symbol mapping是自动生成的，一般不需要手动修改。请将符号映射文件加入版本管理，以使得每次混淆都能产生固定的名称映射。如果你希望每次混淆
后的名称跟之前不一样，可以在混淆前删除symbol mapping文件。

`SymbolObfusSettings.SymbolMappingFile`字段中配置了symbol mapping文件的路径，默认值为`Assets/Obfuz/SymbolObfus/symbol-mapping.xml`。

由于symbol mapping文件保存了函数混淆前后的映射关系，因此symbol mapping也被用于[还原混淆堆栈日志](./deobfuscate-stacktrace)。

## 混淆名前缀

为了方便区分旧名称和混淆后的名称，混淆名默认都会添加`$`前缀。`SymbolObfusSettings.ObfuscatedNamePrefix`字段配置了该前缀字符串。
如果不希望使用这个前缀，可以改为自定义的字符串。前缀字符串也可以为空，不影响混淆正确性。

## Namespace混淆

默认情况下，为了保持命名空间结构，相同的Namespace会映射到同一个混淆后的Namespace。`SymbolObfusSettings.UseConsistentNamespace`字段中
配置了这个行为，默认为true。如果不想保持相同映射，可以禁用这个选项。

## Debug模式

默认情况下，生成的混淆名类似于`$a`之类，如果不去查看symbol mapping文件，很难从代码中得知原始名是哪个。这给追踪符号混淆引发的bug时，带来较多不便，
因此Obfuz特地支持了Debug模式。在Debug模式下，会将`Name`映射为`$Name`，可以直接看出原始名是什么，方便调试追踪。

Debug模式下的混淆规则是固定的，即`Name`映射为`$Name`。如果遇到名称冲突，会尝试`$Name1`、`$Name2`直到找到不冲突的名字。因此Debug模式下会
**忽略**symbol mapping文件，既不会加载它，也不会混淆完成后更新它。

Debug模式混淆名不受混淆名前缀配置的影响。以`Name`为例，即使你将前缀改为`#`，Debug模式下生成的混淆依然是`$Name`而不是`#Name`。

`SymbolObfusSettings.Debug`字段配置了是否开启Debug模式，默认关闭。

## Detect Reflection Compatibility

在符号混淆后，反射相关代码是最容易出现运行问题的代码。为了减少定位问题的时间，Obfuz支持混淆时检测潜在的在符号混淆后会失败的代码，打印错误或警告。

Obfuz检测以下函数调用：

- `Enum.Parse`
- `Enum.Parse<T>`
- `Enum.TryParse<T>`
- `Enum.GetName`
- `Enum.GetNames`
- `<EnumType>.ToString`
- `Type.GetType`
- `Assembly.GetType`
- `Type.GetField`
- `Type.GetFields`
- `Type.GetMethod`
- `Type.GetMethods`
- `Type.GetProperty`
- `Type.GetProperties`
- `Type.GetEvent`
- `Type.GetEvents`
- `Type.GetMember`
- `Type.GetMembers`

Obfuz会尽可能从上下文中找到这些函数调用作用的类型，如果能找到，并且类型名被混淆，则打印错误，如果无法确定作用类型，则打印警告。

示例如下：

```csharp

// MyColor类型名和枚举项都会被混淆
enum MyColor
{
    A,
    B,
    C,
}

class TestDetectReflectionCompatibility
{
    void TestKnownEnum()
    {
        Enum.Parse(typeof(MyColor)， "A"); // 打印错误，因为可以推断出要Parse的类型是MyColor，而MyColor会被混淆，运行必然出错
        Enum.Parse<MyColor>("A"); // 打印错误，因为可以推断出要Parse的类型是MyColor，而MyColor会被混淆，运行必然出错
        MyColor.A.ToString(); // 打印错误，因为可以推断出要ToString的类型是MyColor，而MyColor枚举项会被混淆，运行必然出错
    }

    void TestUnknownEnum(Type type)
    {
        Enum.Parse(type, "A"); // 打印警告，因为无法推断出被Parse的类型。
    }
}

```

打印的错误或者警告日志格式类似：`[ReflectionCompatibilityDetector] Reflection compatibility issue in {method}(): Enum.GetNams field of type:{type full name} is renamed.`

:::tip

混淆后在Console的搜索框上填入`[ReflectionCompatibilityDetector]`可以快速看到所有错误或者警告日志。

:::

## 默认禁用符号混淆的目标

Obfuz已经尽力考虑Unity引擎下常见的需要禁用混淆名称的场合，以下目标不会被混淆，也不会受规则文件的影响:

- 继承自MonoBehaviour或ScriptableObject或标记了`[Serializable]`（我们统称这三类为可序列化类）的脚本类的名称
- 可序列化类脚本类中Awake、Start之类的事件函数
- 可序列化类中public类型可序列化字段或者`[SerializedField]`特性标记的字段
- delegate的成员字段及函数
- enum的私有字段
- 标记了`[RuntimeInitializeOnLoadMethod]`的函数及它的父类名（否则Unity无法根据类型和函数名找到此函数）
- 标记了Unity.Behaviour模块的`[BlackboardEnum]`特性的枚举类的类名极其枚举项名称
- 其他情况

## 自定义RenamePolicy

`SymbolObfusSettings.CustomRenamePolicyTypes`中可以配置0到多个自定义RenamePolicy的类型全名。因为这个类型全名不含程序集名，因此要求这个类型全名在AppDomain所有程序集中唯一。

自定义RenamePolicy必须实现`Obfuz.ObfusPasses.SymbolObfus.IObfuscationPolicy`接口或者继承自`Obfuz.ObfusPasses.SymbolObfus.Policies.ObfuscationPolicyBase`，并且有一个参数为object类型的构造函数。示例如下：

```csharp
using Obfuz.ObfusPasses.SymbolObfus.Policies;

public class MyRenamePolicy : ObfuscationPolicyBase
{
    public MyRenamePolicy(object systemRenameObj)
    {
    }

    public override bool NeedRename(dnlib.DotNet.TypeDef typeDef)
    {
        return typeDef.Name != "TestClassForCustomRenamePolicy";
    }

    public override bool NeedRename(dnlib.DotNet.MethodDef methodDef)
    {
        return methodDef.Name != "MethodForCustomRenamePolicy";
    }

    public override bool NeedRename(dnlib.DotNet.FieldDef fieldDef)
    {
        return fieldDef.Name != "fieldForCustomRenamePolicy";
    }

    public override bool NeedRename(dnlib.DotNet.PropertyDef propertyDef)
    {
        return propertyDef.Name != "PropertyForCustomRenamePolicy";
    }

    public override bool NeedRename(dnlib.DotNet.EventDef eventDef)
    {
        return eventDef.Name != "EventForCustomRenamePolicy";
    }
}

```

## 规则文件


实践中仍然可能需要更精准地控制混淆范围和效果，Obfuz通过规则文件来实现精细的符号混淆控制，允许配置多个规则文件。

规则文件示例如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>

<obfuz>
    <assembly name="Obfuscated">
      <type name="xxxx" obName="1" applyToMembers="none,field,methodName,method,propertyName,propertyGetterSetterName,property,eventName,eventAddRemoveFireName,event,all,*"
        applyToNestedTypes="1"
        modifier="public,protected,private"
        classType="class,struct,enum,interface,delegate"
        inheritTypes="Unity.Entities.IComponentData,MyInterface"
        hasCustomAttributes="test.MyCustomAttribute1,test.MyCustomAttribute2"

        >
          <field name="f" obName="0" modifier="public,protected,private"/>
          <method name="m" obName="0" modifier="public,protected,private"/>
          <property name="p" obName="0" applyToMembers="propertyGetterSetterName"/>
          <event name="e" obName="0" applyToMembers="eventAddRemoveFireName"/>
      </type>
      <type name="Aaaa.TopClass/SubClass">
      </type>
    </assembly>

    <assembly name="Tests">

    </assembly>
</obfuz>
```

顶层tag必须是obfuz，次级tag必须是assembly。

所有目标(assembly、type、field、method、property、event)都**允许定义多条与它匹配的规则**，以最后一个obName不为空的规则的值为准。

### nullable bool类型

obName、applyToMembers、applyToMethods之类的属性为可空bool属性，它的解析规则如下：

- 如果未设置或者为长度为零的字符串，则解析为null
- 如果为0、false则解析为false
- 如果为1、true则解析为true

## modifier 类型

type、method、field、event、property都可以定义modifier属性，指示此项规则只哪些可见类型的目标生效。modifier如果为空，对所有可见类型的都生效。如果非空，可以是以下值的**组合**，以`,`分割：

- public。 对public元数据都生效。如果目标是public嵌套类型，即使包围它的类型不是public，也匹配此条规则。
- protected。 对protected 元数据生效。如果目标是protected嵌套类型，即使包围它的类型不是public或者protected，也匹配此条规则。
- private。 对private 元数据生效。如果目标是private嵌套类型，无论包围它的类型的可见性如何都匹配此条规则。

例如想仅对public和protected生效，可以可以配置为`public|protected`。

## classType 类型

type规则可以定义classType属性，指示当前规则对哪种类型生效。 classType如果为空，对**所有类型都生效**。如果非空，可以是以下值的**组合**，以`,`分割：

- class。 对普通类型生效，不包含struct、enum、interface、delegate。
- struct。 对普通值类型生效，不包括enum。
- interface。对接口类型生效。
- enum。 对枚举类型生效。
- delegate。对delegate类型生效。

例如你想对所有非值类型生效，则可以配置为`class|interface|delegate`。

## applyToMember类型

applyToMember类型描述了对哪些元数据不混淆。可以为空，表示不作用于任何目标，或者是以下组合，以`,`分割：

|类型|描述|
|-|-|
|none|不作用于任何目标|
|field|作用于字段名|
|method|作用于函数名|
|propertyName|作用于property名，但不包含getter和setter函数名|
|propertyGetterSetterName|作用于getter和setter函数名，但不包含property名|
|property|等价于propertyName和propertyGetterSetterName的组合，作用于property名及getter和setter函数名|
|eventName|作用于event名，但不包含add和remove和fire函数名|
|eventAddRemoveFireName|作用于add和remove和fire函数名，但不包含event名|
|event|等价于eventName和eventAddRemoveFireName的组合，作用于event名、add和remove和fire函数名|

### assembly 配置规则

|属性|可空|描述|
|-|-|-|
|name|否|name必须是被混淆的程序集，即必须在`AssemblySettings.AssemblyToObfuscate`出现。一个assembly可以有多个assembly规则|

### type 配置规则

|属性|可空|描述|
|-|-|-|
|name|是|name为通配符表达式。如果为空则表示匹配所有类型。嵌套类型使用`/`划分声明所在类型和被包围的子类型，如`test.ClassA/ClassB`。|
|modifier|是|匹配哪些可见类型的目标|
|classType|是|匹配哪种classType|
|**inherit**|是|继承了某些类型或者实现了某些接口，可以配置多个，表示从其中任意一个继承。默认为空，跳过匹配检查。类型或者接口需要填全名但不区分程序集。例如`test.MyInterface`在两个程序集中都有定义，那么实现任何一个接口都认为是符合条件|
|**hasCustomAttributes**|是|类型上是否有某些CustomAttribute。默认为空，跳过此项匹配检查。可以配置多个，表示包含其中至少一个CustomAttribute。CustomAttribute名需要为全名但不区分程序集|
|obName|是|表示是否混淆本类型的命名空间和类型名。如果自身是嵌套子类型没有设置则优先继承ApplyToMember为true的嵌套父类的obName，如果找不到可继承的值，则默认为true|
|applyToMembers|是|obName值的额外作用目标。默认值为空，不会作用于任何成员目标|
|applyToNestedTypes|是|是否将obName属性的值应用于所有嵌套子类型（包括嵌套子类型的嵌套子类型）。默认为true。|

type允许定义field、method、property、event类型的子元素。

### field 配置规则

|属性|可空|描述|
|-|-|-|
|name|是|name为通配符表达式。如果为空则表示匹配所有类型|
|modifier|是|指示匹配哪些可见类型的目标|
|obName|是|表示是否混淆字段名。如果obName为空，则尝试继承applyToMembers属性包含`field`的所在type的obName值|

### property 配置规则

|属性|可空|描述|
|-|-|-|
|name|是|name为通配符表达式。如果为空则表示匹配所有类型|
|modifier|是|指示匹配哪些可见类型的目标|
|obName|是|表示是否混淆property名。如果没有设置则并且type的applyToMembers属性为true并且type设置了obName属性，则继承type的obName值。|
|applyToMembers|是|obName值的额外作用目标，有效取值只能为`propertyGetterSetterName`，取其他值没有意义。如果obName为空，则尝试继承applyToMembers属性包含`propertyName`的所在type的obName值|

### event 配置规则

|属性|可空|描述|
|-|-|-|
|name|是|name为通配符表达式。如果为空则表示匹配所有类型|
|modifier|是|指示匹配哪些可见类型的目标|
|obName|是|表示是否混淆event名。如果没有设置则并且type的applyToMembers属性为true并且type设置了obName属性，则继承type的obName值。|
|applyToMembers|是|obName值的额外作用目标，有效取值只能为`eventAddRemoveFireName`，取其他值没有意义。如果obName为空，则尝试继承applyToMembers属性包含`eventName`的所在type的obName值|

### method 配置规则

|属性|可空|描述|
|-|-|-|
|name|是|name为通配符表达式。如果为空则表示匹配所有类型|
|modifier|是|指示匹配哪些可见类型的目标|
|obName|是|表示是否混淆method名。如果没有设置，则优先继承所属的applyToMember包含`propertyGetterSetterName`的property或applyToMember包含`eventAddRemoveFireName`的event，如果不存在相应的property或event规则，则尝试继承applyToMembers属性包含`method`的所在type的obName值。|
