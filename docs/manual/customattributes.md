# Obfuz CustomAttributes

Obfuz提供了多种`CustomAttribute`，方便直接在代码中配置混淆规则。目前支持的CustomAttribute有：

- ObfuzIgnoreAttribute
- EncryptFieldAttribute

## ObfuzIgnoreAttribute

### 定义

ObfuzIgnoreAttribute的代码实现如下：

```csharp

    [AttributeUsage(AttributeTargets.All, Inherited = false, AllowMultiple = false)]
    public class ObfuzIgnoreAttribute : Attribute
    {
        public ObfuzScope Scope { get; set; }

        public bool ApplyToMembers { get; set; } = true;

        public ObfuzIgnoreAttribute(ObfuzScope scope = ObfuzScope.All)
        {
            this.Scope = scope;
        }
    }

```

|参数|描述|
|-|-|
|scope|混淆作用范围。类型为ObfuzScope，默认值为Obfuzscope.All，即会禁用类型名、字段、函数、property、event及子类型的所有混淆|
|ApplyToMembers|成员是否继承当前ObfuzIgnoreAttribute，如果为true，所有成员（字段、函数、property、event）也会等同定义了当前的ObfuzIgnoreAttribute。默认为true。此参数只对类型、property、event有效。|
|ApplyToNestedTypes|嵌套子类型是否继承当前ObfuzIgnoreAttribute，如果为true，所有嵌套子类型也会等同定义了当前的ObfuzIgnoreAttribute。默认为true。此参数只对类型有效。|

枚举类ObfuzScope的实现如下：

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

### 作用目标

`ObfuzIgnoreAttribute`可以添加到类型、函数、字段、Property、event上，被添加的元数据会被禁用所有混淆操作。

|[ObfuzIgnore]添加的目标|描述|
|-|-|
|类型|该类型及所有内嵌子类型、成员字段、函数、Property、event都不会被混淆|
|函数|该函数名及参数及函数体都不会被混淆。注意！函数代码中引用的符号如果被混淆或者加密，则仍然会被替换为混淆后的版本。显然必须这么做才能保证正确性。|
|字段|会被禁用符号混淆、字段加密在内的所有可作用于字段的混淆操作|
|property|会被禁用符号混淆在内的所有可作用于Property的混淆操作，但仍然会混淆getter和setter函数。如果想禁止混淆getter和setter函数需要在函数上添加`[ObfuzIgnore]`|
|event|会被禁用符号混淆在内的所有可作用于event的混淆操作，但仍然会混淆add、remove函数。如果想禁止混淆这些函数需要在函数上添加`[ObfuzIgnore]`|

### 其他说明

`[ObfuzIgnore]`不能用于Assembly对象，例如`[assembly: ObfuzIgnore]`不会任何效果。想对某个程序集禁用混淆，
只需要将它从混淆列表`AssemblySettings.AssemblyToObfuscate`移除即可。

`[ObfuzIgnore]`会在最后的RemoveObfuzAttributesPass中被移除，因此它只会出现在源码和原始程序集中，不会出现在最终的混淆后的程序集中。

### 示例代码

```csharp

  // 本类型及嵌套类型的类型名、字段、函数、property、event都不会被混淆
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

    // 本类型及嵌套类型的类型名、字段、函数、property、event都会被混淆
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

    
    // 此类型及嵌套子类型的类型名不会被混淆，它们的字段、property、event、函数全部会被混淆
    [ObfuzIgnore(ObfuzScope.TypeName)]
    public class TestObfuzIgnoreTypeName
    {
        public int x; // 被混淆
        public int Value { get; set; } // 被混淆

        public void Run() // 被混淆
        {
            Console.WriteLine("TestObfuzIgnore.Run");
        }

        public event Action Handler; // 被混淆

        public class NestedType1 // 不会被混淆
        {
            public int x; // 被混淆
            public int Value { get; set; } // 被混淆

            public void Run() // 被混淆
            {
                Console.WriteLine("TestObfuzIgnore.Run");
            }

            public event Action Handler; // 被混淆

            public class NestedType2 // 被混淆
            {
                public int x; // 被混淆
                public int Value { get; set; } // 被混淆

                public void Run() // 被混淆
                {
                    Console.WriteLine("TestObfuzIgnore.Run");
                }

                public event Action Handler; // 被混淆
            }
        }
    }

    // 此类型及嵌套类型的字段不会被混淆，但类型名及method、event、property仍然会被混淆
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

EncryptFieldAttribute提供代码中便捷地标记某个字段为加密字段的办法。

它的优先级高于Obfuscation Pass规则和`[ObfuzIgnore]`。只要对某个字段添加了`[EncryptField]`特性，即使字段及所在类型有`[ObfuzIgnore]`特性，仍然会被加密。

示例代码：

```csharp

[ObfuzIgnore]
class A
{
  [EncryptField]
  public int x1; // 变量x1仍然会被加密，无视类型上的[ObfuzIgnore]
  
  [ObfuzIgnore]
  [EncryptField]
  public int x2; // 变量x2仍然会被加密，无视字段上的[ObfuzIgnore]

  public int y; // 变量y不会加密，也不会被释加任何混淆或加密Pass
}

```
