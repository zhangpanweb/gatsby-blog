---
title: "eslint基础配置须知"
date: "2019-03-17"
description: "eslint是JavaScript开发必备工具，在此记录eslint基础配置规则"
---


安装

```bash
npm install eslint --save-dev
```

初始化

```bash
./node_modules/.bin/eslint --init
```

执行上述命令，命令行会让你回答一下问题，包括项目的运行环境、框架等，回答后，会生成一个默认配置文件

------



#### parserOptions

指定eslint能够识别的语法，配置解析选项能够帮助eslint判断什么属于解析错误。默认情况下，eslint能够识别`es5`和`jsx`的语法，可以通过设置`parserOptions`选项覆盖这些默认配置。`parserOptions`的可配置项：

- ecmaVersion：希望能够识别的`ECMAScript`语法版本。指定版本即可，比如对于`es6`，设置此值为`6`或`2015`，其他版本依次类推。
- sourceType：默认为`script`，可设置为`module`。若设置为`script`，则无法在文件中使用`import`等。
- ecmaFeatures：指定其他可用的语言功能，可配置值：
  - globalReturn：是否允许在全局作用域中使用`return`语句
  - impliedStrict：是否开启全局的严格模式（在`es5`及更高版本可用）
  - jsx：开启`jsx`



##### 需要注意的点

- 设置`ecmaVersion`为`es6`，可以让eslint识别`es6`的语法，但是它并不代表eslint能够识别`es6`中类似于`Set`这些新的`esmaScript`全局变量。需要配合设置`{env:{es6:true}}`使eslint识别这些全局变量。只设置`ecmaVersion`为`es6`，在使用`Set`等全局变量时，会遇到`no-undef`的eslint报错。只设置`{env:{es6:true}}`但是`ecmaVersion`小于`6`，则无法使用`const`等语法，会遇到eslint` parser error`的错误。
- 设置`jsx`为`true`后，能够识别`jsx`不代表能够识别React，React使用了一些eslint无法识别的`jsx`语法。若要使用`React`，可以使用[` eslint-plugin-react`](https://github.com/yannickcr/eslint-plugin-react)

------



#### parser

默认情况下，eslint使用[`Espree`](https://github.com/eslint/espree)作为解析器，但是可以自行通过`parser`字段设置解析器。详情可见[`eslint官网parser配置项`](https://eslint.org/docs/user-guide/configuring#specifying-parser)

------



#### env

`env`配置项指定了项目需要运行的环境，eslint根据env判断，哪些全局变量是可用的哪些是不可用的。比如设置了`node:true`后，`__dirname`变得可用，不然会报`no-undef`错误。

- 常用配置项有：`node`、`browser`、`es6`、`mocha`等，所有列表可见[`eslint`官网配置项](https://eslint.org/docs/user-guide/configuring#specifying-environments)
- 可以同时指定多个环境
- 可以通过配置文件指定，也可以通过文件注释的方式指定，如下

```javascript
/* eslint-env node, mocha */
```

- 除了可以使用上面`node`这些已提前设置好的配置项外，也可以通过`plugins`的方式引入环境，如下，指定`plugins`，然后在`env`中通过`plugins/xx`的方式引入。

```javascript
{
    "plugins": ["example"],
    "env": {
        "example/custom": true
    }
}
```

------



#### global

在通过`env`设置一部分变量后，可能仍然有部分是用户需要的全局变量，此时若不进行配置，也会报`no-undef`的错误，所以需要通过`global`的配置项告诉eslint这些变量是全局变量。

- globa不仅可以告诉eslint哪些变量是全局变量，也可以告诉eslint这些全局变量是否可以变更，配置方式如下
- 可以通过文件注释的方式进行配置

```javascript
/* global var1, var2 */

/* global var1:writable, var2:writable *
```

- 也可以通过配置文件的方式进行配置

```javascript
{
    "globals": {
        "var1": "writable",
        "var2": "readonly"
    }
}
```

- 开启[no-global-assign](https://eslint.org/docs/rules/no-global-assign)规则可以使eslint检测用户是否有给不允许重写的全局变量赋值，若有此行为，则会进行报错

------



#### plugins

eslint可以使用第三方插件，通过`npm`下载后，在配置文件中的`plugins`字段进行配置即可。

```javascript
{
    "plugins": [
        "plugin1",
        "eslint-plugin-plugin2"
    ]
}
```

由于`Node`的`require`函数的特性，全局安装的eslint只能使用全局安装的插件，本地安装的eslint只能使用本地安装的插件。

------



#### rules

eslint有很多`rules`，每条规则可以被赋值为`off`(或0)、`warn`(或1)，`error`(或2)。

- 文件注释的方式配置

```javascript
/* eslint eqeqeq: 0, curly: 2 */

若规则有更多配置项时，可以使用数组的方式：
/* eslint quotes: ["error", "double"], curly: 2 */
```

- 配置文件的方式

```javascript
{
    "rules": {
        "eqeqeq": "off",
        "curly": "error",
        "quotes": ["error", "double"]
    }
}

```

- 配置插件提供的规则。此时记得去掉插件的`eslint-plugin`前缀，eslint会使用不加前缀的名称去匹配

```javascript
/* eslint "plugin1/rule1": "error" */

```

```javascript
{
    "plugins": [
        "plugin1"
    ],
    "rules": {
        "plugin1/rule1": "error"
    }
}

```

------



#### 特定情况禁用eslint

- 使用注释的方式禁用

```javascript
/* eslint-disable */

/* eslint-disable no-alert, no-console */

alert('foo'); // eslint-disable-line

```

------



#### overrides

使用`override`字段可以对特定文件使用特定规则。具体的文件路径解析规则等可以参见[`configuration-based-on-glob-patterns`](https://eslint.org/docs/user-guide/configuring#configuration-based-on-glob-patterns)

```javascript
{
  "rules": {...},
  "overrides": [
    {
      "files": ["*-test.js","*.spec.js"],
      "rules": {
        "no-unused-expressions": "off"
      }
    }
  ]
}

```

------



#### 配置的层叠

- eslint配置的优先级： 内联文件注释配置 > 命令行配置 >本文件夹中的配置文件 > 父文件夹中的配置文件 > 跟文件夹中的`.eslint.*`配置文件 > 根文件夹中`package.json`中`eslintConfig`字段中的配置
- 若配置冲突，优先级高的配置覆盖优先级低的配置
- 一般来说，eslint会去寻找配置文件，直到文件系统的根目录，这会导致一些意想不到的问题（全局eslint配置可能会意外影响到本地文件夹），设置`root:true`会使eslint停止向上查找

------



#### 配置的继承

##### 继承规则

- 使用`extends`字段，配置可以继承一些已有的配置
- `extends`字段可以被指定为代表某个配置的字符串，或一个数组，数组中，每个后面的配置继承前面的配置
- rules覆盖继承过来的配置，可以单独覆盖其等级，也可以同时覆盖其等级和配置项。如继承的配置是`"quotes": ["error", "single", "avoid-escape"]`，`rules`中指定配置为`"eqeqeq": "warn"`，则最终配置为`"eqeqeq": ["warn", "allow-null"]`，只覆盖其等级

##### 配置继承的方式

- 继承自`eslint:recommended`，`eslint:recommended`内置了一系列[核心规则](https://eslint.org/docs/rules/)，这些核心规则只会在eslint主版本变更是会进行变动

```javascript
module.exports = {
    "extends": "eslint:recommended",
}

```

- 继承共享配置包。共享配置包指的是一个npm包，比如`eslint-config-standard`，它会导出一个配置文件，可以把它下载到本地eslint可以引用到的地方，然后通过`extends`继承配置包中的配置（此时可以忽略掉包名的`eslint-config-`前缀）

```javascript
module.exports = {
    "extends": "standard",
}

```

- 从插件继承。eslint插件，是一个npm包，里面通常会导出一系列规则。有些插件也会导出一个或多个命名配置。若需要继承插件的配置，则需要先安装插件到eslint可以引用到的地方。然后配置`plugins`字段和`extends`字段，`extends`字段格式为`plugins:packageName/configurationName`（`packageName`可以忽略`eslint-plugin-`前缀）

```javascript
{
    "plugins": [
        "react"
    ],
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended"
    ],
    "rules": {
       "no-set-state": "off"
    }
}

```

- 继承自某个文件。

```javascript
{
    "extends": [
        "./node_modules/coding-standard/eslintDefaults.js",
        "./node_modules/coding-standard/.eslintrc-es6",
    ],
}

```

- 继承自`all`，配置方式为:`"extends": "eslint:all"`。这会启用eslint中所有内置的核心规则。这些规则会跟随eslint的发版（包括小版本和大版本）而变化。不推荐在正式项目中用这个配置，因为这会导致再升级eslint后，eslint会针对原有代码进行报错。

------



#### .eslintignore

- 可以创建`.eslintignore`文件，通过正则的方式，指定不进行lint的文件
- `node_modules`和`bower_components`默认忽略