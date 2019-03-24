---
title: "CSS的transform属性"
date: "2019-03-23"
description: "在给元素添加动画时，经常会用到transform属性。本文介绍transform属性的基本用法。"
---

CSS的`transform`属性，是用于对某个元素进行旋转、缩放等动作，它是在给元素添加动画的基本属性。它的基本使用方式是：

```css
tranform: <transfrom-function> <transform-function> ... 
```

`<transform-function>`指的则是一个或多个动作，这些动作包括：`matrix` 、 `translate`、 `scale`、 `rotate`、 `perspective` 等等。

------

#### translate

##### 基本

```css
transform: translate(x,y)
```

两个参数都是长度：

- 第一个表示在水平方向的移动距离，为正表示往右移动，为负表示往左移动
- 第二个表示垂直方向移动距离，为正表示往下移动，为负表示往上移动。不指定时，采用默认值0，即不在垂直方向移动

##### 其他

- translateX(n) = translate(n,0)
- translateY(n) = translate(0,n)
- translate3d(x,y,z)：3D空间下，在x、y、z三个方向分别移动
- translateZ(n) = translate3d(0,0,n)

------

#### scale

##### 基本

`scale`的作用是进行元素的缩放，使用方式为：

```css
scale(x,y)
```

x、y表示**缩放倍数**。需要注意的是：

- 此处的x与y不可指定为想要变化到的长度。如指定`transform:translate(50px,50px) scale(2px,2px)`会导致整条语句无效，`translate`也不会执行。
- 当x、y大于1时，元素被“拉伸”；当小于1时，元素被压缩；当为1时，不会变化。
- 整个缩放采用的是“拉伸”或“压缩”的方式，而不是“另外增加”。如果水平和垂直倍数不相同，会导致里面的内容变形。
- 默认拉伸或压缩，默认的固定点是水平方向的中点或垂直方式上的中点。这个固定点可以通过`transform-origin`进行自定义。
- 缩放倍数为负的情况下，会被“压缩过头”，比如，若设置为x为-1，y为0，最终的效果类似于元素延着水平方向的中点进行水平翻转。

##### 其他

- scale3d(x,y,z) 相对 scale(x,y) 多了z方向上的伸缩
- scaleX、scaleY、scaleZ分别表示在对应方向上进行缩放，其他方向上保持不变（即相当于在使用scale时其他方向上被设置为1）

------

#### rotate

##### 基本

`rotate`能够使元素进行旋转，使用方式为

```css
transform:rotate(a)
```

其中参数a是一个旋转角度。

- a的单位可以是`deg`、`grad`、`rad`、`turn` ，具体可见有关[`MDN<angle>的解释`](https://developer.mozilla.org/en-US/docs/Web/CSS/angle)。
- a为正值表示顺时间旋转，a为负值表示逆时针旋转。
- 旋转围绕的固定点可以通过`transform-origin`进行定义，其默认值为元素的中心点。
- `rotate`会改变元素的轴线方向。比如先`rotate(45deg)`，再进行`translateX(50px)`，旋转后，元素x方向的轴线变为45度，此时再`translate`，就会往45度的方向移动。

##### 其他

- rotate3d() 相对于 rotate多了 z 轴上的旋转
- rotateX、rotateY、rotateZ 即为在此方向上单独旋转

------

#### skew

##### 基本

skew能够使元素倾斜：

```css
skew(x,y)
```

参数x、y是一个代表倾斜角度的角度值。

- x为正则会使元素向左倾斜，为负会使元素向右倾斜。默认情况下，x方向上的倾斜，以**元素底边**和**元素水平中线**为基线。
- y为正，会使元素像右倾斜，为负会使元素向左倾斜。默认情况下，y方向上的倾斜，以**元素右边**和**元素垂直中线**为基线。所以，当y为正时，看起来，元素会往左上方倒；为负时，往左下方倒。
- 可以通过`transform-origin`来指定元素的倾斜基线。例如，若设置`transform-origin:left`，此时y为正会使元素看起来往右下方倒。

##### 其他

- shewX和shewY表示在对应单独方向倾斜

------

#### matrix和perspective

- matrix。其实上面四种变化都是可以由matrix变化而来，具体可以见 [理解CSS3 transform中的Matrix](<https://www.zhangxinxu.com/wordpress/2012/06/css3-transform-matrix-%E7%9F%A9%E9%98%B5/>) 这篇文章，也可以使用[Matrix resolutions](<https://meyerweb.com/eric/tools/matrix/>)这个工具进行转化，(这个网站第一眼看上去还是很好玩的，哈哈）
- perspective 可以设置用户和z=0平面的距离，其距离可以通过参数进行指定，比如`perspective(800px)`

------

#### transform-origin

`transform-origin`表示的是应用转化的点（转换起点），比如`rotate`在进行旋转时旋转围绕的点。

##### 值的构成

```css
transfrom-origin: x-offset y-offset z-offset
```

如上所示，`transform-origin`的三个值，分别表示x、y、z轴上的偏移量。

- 由这三个偏移量定义的一个点，即为元素进行变化的转换起点。
- 默认初始值是：`transform-origin: 50% 50%;`
- 对 x-offset和y-offset，偏移的起点是元素的左上角，x为正表示右偏移，y为正表示向下偏移

##### 偏移量的赋值

- x-offset、y-offset 可以是长度值、百分数和关键词(`left`、`right`、`top`、`bottom`)
- z-offset只能是长度值

##### 关键词

关键词可以看做是百分数值的另外一种写法，其对应关系如下

- left = 0%
- right = 100% 
- center = 50%
- top = 0%
- bottom = 100%
