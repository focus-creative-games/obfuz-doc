# Symbol Obfuscation

Symbols refer to metadata with names in assemblies. Symbol obfuscation replaces the names of these symbols with obfuscated names while fixing all metadata that references these symbols to ensure reference correctness.

Symbol obfuscation supports obfuscating the following metadata:

- Type names (including namespaces)
- Field names
- Function names
- Function parameters
- Property names
- Event names

## Settings

`ObfuzSettings.SymbolObfusSettings` contains obfuscation-related settings. For details, see [Configuration](./configuration).

## Symbol Mapping File

To ensure obfuscation stability, a symbol mapping file is used to record the mapping relationship between old and new symbols. Each time obfuscation is performed, Obfuz will try to use the obfuscated names from the previous time, unless there are unexpected name conflicts.

Symbol mapping is automatically generated and generally does not need manual modification. Please add the symbol mapping file to version control so that each obfuscation can produce consistent name mappings. If you want the names after each obfuscation to be different from before, you can delete the symbol mapping file before obfuscation.

The path of the symbol mapping file is configured in the `SymbolObfusSettings.SymbolMappingFile` field, with a default value of `Assets/Obfuz/SymbolObfus/symbol-mapping.xml`.

Since the symbol mapping file saves the mapping relationship of functions before and after obfuscation, symbol mapping is also used for [deobfuscating stack traces](./deobfuscate-stacktrace).

## Obfuscated Name Prefix

To facilitate distinguishing between old names and obfuscated names, obfuscated names by default have a `$` prefix added. The `SymbolObfusSettings.ObfuscatedNamePrefix` field configures this prefix string. If you don't want to use this prefix, you can change it to a custom string. The prefix string can also be empty without affecting obfuscation correctness.

## Namespace Obfuscation

By default, to maintain namespace structure, the same namespace will be mapped to the same obfuscated namespace. The `SymbolObfusSettings.UseConsistentNamespace` field configures this behavior, defaulting to true. If you don't want to maintain the same mapping, you can disable this option.

## Debug Mode

By default, generated obfuscated names are like `$a`, etc. If you don't check the symbol mapping file, it's difficult to know what the original name was from the code. This brings considerable inconvenience when tracking bugs caused by symbol obfuscation, so Obfuz specifically supports Debug mode. In Debug mode, `Name` is mapped to `$Name`, allowing you to directly see what the original name was, facilitating debugging and tracking.

The obfuscation rules in Debug mode are fixed, i.e., `Name` is mapped to `$Name`. If name conflicts are encountered, it will try `$Name1`, `$Name2` until a non-conflicting name is found. Therefore, Debug mode will **ignore** the symbol mapping file, neither loading it nor updating it after obfuscation is completed.

Debug mode obfuscated names are not affected by the obfuscated name prefix configuration. Taking `Name` as an example, even if you change the prefix to `#`, the obfuscation generated in Debug mode is still `$Name` rather than `#Name`.

The `SymbolObfusSettings.Debug` field configures whether to enable Debug mode, disabled by default.

## Detect Reflection Compatibility

After symbol obfuscation, reflection-related code is the most likely to have runtime issues. To reduce the time spent locating problems, Obfuz supports detecting potentially failing code after symbol obfuscation during obfuscation, printing errors or warnings.

Obfuz detects the following function calls:

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

Obfuz will try to find the types that these function calls act on from the context. If found and the type name is obfuscated, it prints an error. If the acting type cannot be determined, it prints a warning.

Example:

```csharp

// MyColor type name and enum items will be obfuscated
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
        Enum.Parse(typeof(MyColor), "A"); // Prints error because it can infer the type to Parse is MyColor, and MyColor will be obfuscated, runtime will inevitably fail
        Enum.Parse<MyColor>("A"); // Prints error because it can infer the type to Parse is MyColor, and MyColor will be obfuscated, runtime will inevitably fail
        MyColor.A.ToString(); // Prints error because it can infer the type to ToString is MyColor, and MyColor enum items will be obfuscated, runtime will inevitably fail
    }

    void TestUnknownEnum(Type type)
    {
        Enum.Parse(type, "A"); // Prints warning because the type being Parsed cannot be inferred.
    }
}

```

The format of printed error or warning logs is similar to: `[ReflectionCompatibilityDetector] Reflection compatibility issue in {method}(): Enum.GetNams field of type:{type full name} is renamed.`

:::tip

After obfuscation, you can quickly see all error or warning logs by entering `[ReflectionCompatibilityDetector]` in the Console search box.

:::

## Targets with Symbol Obfuscation Disabled by Default

Obfuz has made every effort to consider common scenarios in Unity engine where obfuscated names need to be disabled. The following targets will not be obfuscated and will not be affected by rule files:

- Names of script classes that inherit from MonoBehaviour or ScriptableObject or are marked with `[Serializable]` (we collectively call these three types serializable classes)
- Event functions like Awake, Start in serializable script classes
- Public serializable fields or fields marked with `[SerializedField]` attribute in serializable classes
- Member fields and functions of delegates
- Private fields of enums
- Functions marked with `[RuntimeInitializeOnLoadMethod]` and their parent class names (otherwise Unity cannot find this function based on type and function name)
- Class names and enum item names of enum classes marked with Unity.Behaviour module's `[BlackboardEnum]` attribute
- Other situations

## Custom RenamePolicy

`SymbolObfusSettings.CustomRenamePolicyTypes` can configure 0 to multiple custom RenamePolicy type full names. Since this type full name does not include assembly name, it requires that this type full name be unique across all assemblies in the AppDomain.

Custom RenamePolicy must implement the `Obfuz.ObfusPasses.SymbolObfus.IObfuscationPolicy` interface or inherit from `Obfuz.ObfusPasses.SymbolObfus.Policies.ObfuscationPolicyBase`, and have a constructor with an object type parameter. Example:

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

## Rule Files

In practice, more precise control of obfuscation scope and effects may still be needed. Obfuz implements fine symbol obfuscation control through rule files, allowing configuration of multiple rule files.

Rule file example:

```xml
<?xml version="1.0" encoding="UTF-8"?>

<obfuz>
    <assembly name="Obfuscated">
      <type name="xxxx" obName="1" applyToMembers="none,field,methodName,method,propertyName,propertyGetterSetterName,property,eventName,eventAddRemoveFireName,event,all,*"
        applyToNestedTypes="1"
        modifier="public,protected,private"
        classType="class,struct,enum,interface,delegate"
        inherit="Unity.Entities.IComponentData,MyInterface"
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

The top-level tag must be obfuz, and the second-level tag must be assembly.

All targets (assembly, type, field, method, property, event) **allow defining multiple rules matching them**, with the value of the last rule with non-empty obName taking precedence.

### Nullable Bool Type

Attributes like obName, applyToMembers, applyToMethods are nullable bool attributes with the following parsing rules:

- If not set or is a zero-length string, parsed as null
- If 0 or false, parsed as false
- If 1 or true, parsed as true

## Modifier Type

Type, method, field, event, property can all define modifier attributes, indicating which visibility types of targets this rule takes effect on. If modifier is empty, it takes effect on all visibility types. If non-empty, it can be a **combination** of the following values, separated by `,`:

- public. Takes effect on all public metadata. If the target is a public nested type, it matches this rule even if the surrounding type is not public.
- protected. Takes effect on protected metadata. If the target is a protected nested type, it matches this rule regardless of the visibility of the surrounding type.
- private. Takes effect on private metadata. If the target is a private nested type, it matches this rule regardless of the visibility of the surrounding type.

For example, if you want it to take effect only on public and protected, you can configure it as `public|protected`.

## ClassType Type

Type rules can define classType attributes, indicating which types the current rule takes effect on. If classType is empty, it **takes effect on all types**. If non-empty, it can be a **combination** of the following values, separated by `,`:

- class. Takes effect on ordinary types, not including struct, enum, interface, delegate.
- struct. Takes effect on ordinary value types, not including enum.
- interface. Takes effect on interface types.
- enum. Takes effect on enum types.
- delegate. Takes effect on delegate types.

For example, if you want it to take effect on all non-value types, you can configure it as `class|interface|delegate`.

## ApplyToMember Type

ApplyToMember type describes which metadata not to obfuscate. Can be empty, indicating no action on any target, or a combination of the following, separated by `,`:

|Type|Description|
|-|-|
|none|No action on any target|
|field|Acts on field names|
|method|Acts on function names|
|propertyName|Acts on property names, but not including getter and setter function names|
|propertyGetterSetterName|Acts on getter and setter function names, but not including property names|
|property|Equivalent to combination of propertyName and propertyGetterSetterName, acts on property names and getter and setter function names|
|eventName|Acts on event names, but not including add, remove and fire function names|
|eventAddRemoveFireName|Acts on add, remove and fire function names, but not including event names|
|event|Equivalent to combination of eventName and eventAddRemoveFireName, acts on event names, add, remove and fire function names|

### Assembly Configuration Rules

|Attribute|Nullable|Description|
|-|-|-|
|name|No|name must be an obfuscated assembly, i.e., must appear in `AssemblySettings.AssemblyToObfuscate`. An assembly can have multiple assembly rules|

### Type Configuration Rules

|Attribute|Nullable|Description|
|-|-|-|
|name|Yes|name is a wildcard expression. If empty, matches all types. Nested types use `/` to separate the declaring type and enclosed subtypes, like `test.ClassA/ClassB`.|
|modifier|Yes|Which visibility types of targets to match|
|classType|Yes|Which classType to match|
|**inherit**|Yes|Inherits from certain types or implements certain interfaces, can configure multiple, meaning inheriting from any of them. Default is empty, skip matching check. Types or interfaces need full names but don't distinguish assemblies. For example, if `test.MyInterface` is defined in two assemblies, implementing either interface is considered meeting the condition|
|**hasCustomAttributes**|Yes|Whether the type has certain CustomAttributes. Default is empty, skip this matching check. Can configure multiple, meaning containing at least one CustomAttribute. CustomAttribute names need full names but don't distinguish assemblies|
|obName|Yes|Whether to obfuscate the namespace and type name of this type. If it's a nested subtype and not set, priority is given to inheriting obName from nested parent classes with ApplyToMember as true. If no inheritable value is found, defaults to true|
|applyToMembers|Yes|Additional action targets for obName value. Default is empty, won't act on any member targets|
|applyToNestedTypes|Yes|Whether to apply the obName attribute value to all nested subtypes (including nested subtypes of nested subtypes). Default is true.|

Type allows defining field, method, property, event type sub-elements.

### Field Configuration Rules

|Attribute|Nullable|Description|
|-|-|-|
|name|Yes|name is a wildcard expression. If empty, matches all types|
|modifier|Yes|Indicates which visibility types of targets to match|
|obName|Yes|Whether to obfuscate field name. If obName is empty, tries to inherit obName value from the containing type whose applyToMembers attribute includes `field`|

### Property Configuration Rules

|Attribute|Nullable|Description|
|-|-|-|
|name|Yes|name is a wildcard expression. If empty, matches all types|
|modifier|Yes|Indicates which visibility types of targets to match|
|obName|Yes|Whether to obfuscate property name. If not set and type's applyToMembers attribute is true and type has obName attribute set, inherits type's obName value.|
|applyToMembers|Yes|Additional action targets for obName value, valid values can only be `propertyGetterSetterName`, other values are meaningless. If obName is empty, tries to inherit obName value from the containing type whose applyToMembers attribute includes `propertyName`|

### Event Configuration Rules

|Attribute|Nullable|Description|
|-|-|-|
|name|Yes|name is a wildcard expression. If empty, matches all types|
|modifier|Yes|Indicates which visibility types of targets to match|
|obName|Yes|Whether to obfuscate event name. If not set and type's applyToMembers attribute is true and type has obName attribute set, inherits type's obName value.|
|applyToMembers|Yes|Additional action targets for obName value, valid values can only be `eventAddRemoveFireName`, other values are meaningless. If obName is empty, tries to inherit obName value from the containing type whose applyToMembers attribute includes `eventName`|

### Method Configuration Rules

|Attribute|Nullable|Description|
|-|-|-|
|name|Yes|name is a wildcard expression. If empty, matches all types|
|modifier|Yes|Indicates which visibility types of targets to match|
|obName|Yes|Whether to obfuscate method name. If not set, priority is given to inheriting from the belonging property whose applyToMember includes `propertyGetterSetterName` or event whose applyToMember includes `eventAddRemoveFireName`. If corresponding property or event rules don't exist, tries to inherit obName value from the containing type whose applyToMembers attribute includes `method`.|
