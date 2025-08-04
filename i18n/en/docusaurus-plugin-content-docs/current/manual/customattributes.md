# Obfuz CustomAttributes

Obfuz provides various `CustomAttribute`s for conveniently configuring obfuscation rules directly in code. Currently supported CustomAttributes include:

- ObfuzIgnoreAttribute
- EncryptFieldAttribute

## ObfuzIgnoreAttribute

### Definition

The code implementation of ObfuzIgnoreAttribute is as follows:

```csharp

    [AttributeUsage(AttributeTargets.All, Inherited = false, AllowMultiple = false)]
    public class ObfuzIgnoreAttribute : Attribute
    {
        public ObfuzScope Scope { get; set; }

        public bool ApplyToNestedTypes { get; set; } = true;

        public bool ApplyToChildTypes { get; set; } = false;

        public ObfuzIgnoreAttribute(ObfuzScope scope = ObfuzScope.All)
        {
            this.Scope = scope;
        }
    }

```

|Parameter|Description|
|-|-|
|scope|Obfuscation scope. Type is ObfuzScope, default value is ObfuzScope.All, which disables all obfuscation for type names, fields, functions, properties, events and subtypes|
|ApplyToNestedTypes|Whether nested subtypes inherit the current ObfuzIgnoreAttribute. If true, all nested subtypes will also be equivalent to having the current ObfuzIgnoreAttribute defined. Default is true. This parameter is only valid for types.|
|**ApplyToChildTypes**|Whether subtypes that inherit from this type or implement this interface inherit the current ObfuzIgnoreAttribute. If true, all subtypes will also be equivalent to having the current ObfuzIgnoreAttribute defined, except for the ApplyToNestedTypes property value. Default is false. This parameter is only valid for types.|

:::tip
ApplyToChildTypes can conveniently apply certain obfuscation rules uniformly to types derived from a certain class or interface.
:::

The enum class ObfuzScope is implemented as follows:

```csharp
    [Flags]
    public enum ObfuzScope
    {
        None = 0x0,
        TypeName = 0x1,
        Field = 0x2,
        MethodName = 0x4,
        MethodParameter = 0x8,
        MethodBody = 0x10,
        Method = MethodName | MethodParameter | MethodBody,
        PropertyName = 0x20,
        PropertyGetterSetterName = 0x40,
        Property = PropertyName | PropertyGetterSetterName,
        EventName = 0x100,
        EventAddRemoveFireName = 0x200,
        Event = EventName | PropertyGetterSetterName,
        Module = 0x1000,
        All = TypeName | Field | Method | Property | Event,
    }

```

### Applicable Targets

`ObfuzIgnoreAttribute` can be added to types, functions, fields, properties, events. The added metadata will disable the obfuscation operations specified in Scope.

|Target where [ObfuzIgnore] is added|Description|
|-|-|
|Type|The type and all nested subtypes, member fields, functions, properties, events will not be obfuscated|
|Function|The function name, parameters and function body will not be obfuscated. Note! If symbols referenced in function code are obfuscated or encrypted, they will still be replaced with obfuscated versions. Obviously this must be done to ensure correctness.|
|Field|Will disable all obfuscation operations that can act on fields, including symbol obfuscation and field encryption|
|Property|Will disable all obfuscation operations that can act on properties, including symbol obfuscation|
|Event|Will disable all obfuscation operations that can act on events, including symbol obfuscation|

### Other Notes

`[ObfuzIgnore]` cannot be used on Assembly objects, for example `[assembly: ObfuzIgnore]` will have no effect. To disable obfuscation for an assembly,
simply remove it from the obfuscation list `AssemblySettings.AssemblyToObfuscate`.

`[ObfuzIgnore]` will be removed in the final RemoveObfuzAttributesPass, so it only appears in source code and original assemblies, not in the final obfuscated assemblies.

### Example Code

```csharp

  // Type names, fields, functions, properties, events of this type and nested types will not be obfuscated
    [ObfuzIgnore]
    public class TestObfuzIgnoreAll
    {
        public int x;
        public int Value { get; set; }

        public void Run()
        {
            Console.WriteLine("TestObfuzIgnore.Run");
        }

        public event Action Handler;

        public class NestedType1
        {
            public int x;
            public int Value { get; set; }

            public void Run()
            {
                Console.WriteLine("TestObfuzIgnore.Run");
            }

            public event Action Handler;

            public class NestedType2
            {
                public int x;
                public int Value { get; set; }

                public void Run()
                {
                    Console.WriteLine("TestObfuzIgnore.Run");
                }

                public event Action Handler;
            }
        }
    }

    // Type names, fields, functions, properties, events of this type and nested types will be obfuscated
    [ObfuzIgnore(ObfuzScope.None)]
    public class TestObfuzIgnoreNone
    {
        public int x;
        public int Value { get; set; }

        public void Run()
        {
            Console.WriteLine("TestObfuzIgnore.Run");
        }

        public event Action Handler;

        public class NestedType1
        {
            public int x;
            public int Value { get; set; }

            public void Run()
            {
                Console.WriteLine("TestObfuzIgnore.Run");
            }

            public event Action Handler;

            public class NestedType2
            {
                public int x;
                public int Value { get; set; }

                public void Run()
                {
                    Console.WriteLine("TestObfuzIgnore.Run");
                }

                public event Action Handler;
            }
        }
    }

    
    // Type names of this type and nested subtypes will not be obfuscated, but their fields, properties, events, functions will all be obfuscated
    [ObfuzIgnore(ObfuzScope.TypeName)]
    public class TestObfuzIgnoreTypeName
    {
        public int x; // Will be obfuscated
        public int Value { get; set; } // Will be obfuscated

        public void Run() // Will be obfuscated
        {
            Console.WriteLine("TestObfuzIgnore.Run");
        }

        public event Action Handler; // Will be obfuscated

        public class NestedType1 // Will not be obfuscated
        {
            public int x; // Will be obfuscated
            public int Value { get; set; } // Will be obfuscated

            public void Run() // Will be obfuscated
            {
                Console.WriteLine("TestObfuzIgnore.Run");
            }

            public event Action Handler; // Will be obfuscated

            public class NestedType2 // Will be obfuscated
            {
                public int x; // Will be obfuscated
                public int Value { get; set; } // Will be obfuscated

                public void Run() // Will be obfuscated
                {
                    Console.WriteLine("TestObfuzIgnore.Run");
                }

                public event Action Handler; // Will be obfuscated
            }
        }
    }

    // Fields of this type and nested types will not be obfuscated, but type names and methods, events, properties will still be obfuscated
    [ObfuzIgnore(ObfuzScope.Field)]
    public class TestObfuzIgnoreField
    {
        public int x;
        public int Value { get; set; }

        public void Run()
        {
            Console.WriteLine("TestObfuzIgnore.Run");
        }

        public event Action Handler;

        public class NestedType1
        {
            public int x;
            public int Value { get; set; }

            public void Run()
            {
                Console.WriteLine("TestObfuzIgnore.Run");
            }

            public event Action Handler;

            public class NestedType2
            {
                public int x;
                public int Value { get; set; }

                public void Run()
                {
                    Console.WriteLine("TestObfuzIgnore.Run");
                }

                public event Action Handler;
            }
        }
    }
```

## EncryptFieldAttribute

EncryptFieldAttribute provides a convenient way to mark a field as an encrypted field in code.

It has higher priority than Obfuscation Pass rules and `[ObfuzIgnore]`. As long as `[EncryptField]` attribute is added to a field, even if the field and its containing type have `[ObfuzIgnore]` attribute, it will still be encrypted.

Example code:

```csharp

[ObfuzIgnore]
class A
{
  [EncryptField]
  public int x1; // Variable x1 will still be encrypted, ignoring [ObfuzIgnore] on the type
  
  [ObfuzIgnore]
  [EncryptField]
  public int x2; // Variable x2 will still be encrypted, ignoring [ObfuzIgnore] on the field

  public int y; // Variable y will not be encrypted, nor will it be subjected to any obfuscation or encryption Pass
}

```
