---
title: "写一个React全局组件"
date: "2019-03-31"
description: "写全局组件不像局部组件那样直接，文本记录如何写一个比较好的全局React组件。"
---

创建一个React组件库时，类似于`<Button/>`这类局部组件，是页面上的一个固定元素，所以相对来说，写起来比较直观，只需要定义一个组件，让用户直接去引用就可以了。但是对于"弹框"这种全局组件，应该如何写呢？应该如何控制组件的展示呢？

引用局部组件的思路是，让用户从组件层面控制弹框的展示，最后用户使用的代码大概是这个样子。如果`displayModal`为false，则渲染null，从而使组件消失；如果为true，则渲染组件，让组件出现。

```jsx
const App = ()=>{
  const [displayModal,setDisplayModal] = useState(false);
  return (
  	<div>
      <button onClick={()=>setDisplayModal(!displayModal)}>Click</button>
    	{ displayModal ? <Modal/> : null }
    </div>
  )
}
```

但是这种带来的麻烦就是，组件位于在第一层`<div>`内部，任何外层样式都可能会影响到组件的样式，导致每次都需要使用者去手动调整样式。

------

#### 组件直接写在全局上

既然在这个层级内，样式会被干扰到，那么很自然地，需要把组件写到body下面。一种比较直接的方式当然就是在最上层组件里面，加一个Modal组件，然后下层去控制这个Modal的展示与否，大概是这样的：

```javascript
const App = ()=>{
  return (
  	<>
    	{/* 其他逻辑组件 */}
    	<Modal/>
    </>
  )
}
```

这样造成的一是如果有很多全局组件，则要在App下面写一堆组件，显得非常繁琐；二是逻辑分散，如果你写的是组件库，则相当于用户需要在它的最上层组件中去引用，然后在下层组件中去写控制逻辑；三是，如果这样写，Modal和下层组件被隔离开，需要另想办法来控制组件的展示与否

------

#### 使用Portal

React的Portal可以达到，在组件中，可以突破组件层级，将某个组件渲染到一个层级外组件下面，作为那个组件的子组件。使用Portal的写法大概是：

```javascript
const ConfirmModal = ({ visible = false }) => {
  const Modal = (
    <div className={cname('confirm-modal-container', { hidden: !visible })}>
      {/* modal content */}
    </div>
  );

  if (visible) {
    return (
      ReactDOM.createPortal(
        Modal,
        document.body
      )
    );
  } else if (!visible) {
    return null;
  }
};
```

通过visible属性来控制组件的展示与否，如果可见，则返回一个`ReactDOM.createPortal(Modal,document.body)`，否则返回null。在这种情况下，生成的Modal则会变为body的子元素，从而突破层级限制，Modal的样式也不会受到其他组件的影响，Modal的样式大概可以这样：

```css
.confirm-modal-container{
  position: fixed;
  background: rgba(128, 128, 128, 0.5);
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}
```

这样自然就形成了一个全局的蒙层。

另外，在上面情况下，初始是不可见，变为可见后，Modal会被生成称为body的直接子元素；当visible属性由true变为fasle时，由于最后渲染的是null，所以Modal会从body下被移除。

------

#### 通过类名控制可见性

上面的情况已经基本可以达到要求了，但是，每次的可见性切换，都会执行DOM插入与移除操作。一般的可见性都可以通过类名控制，所以做一个小小的更新：

```javascript
const ConfirmModal = ({ visible = false }) => {
  const hasShow = useRef(false);

  const Modal = (
    <div className={cname('confirm-modal-container', { hidden: !visible })}>
      {/* modal content */}
    </div>
  );

  let portal = null;
  if (visible || hasShow.current) {
    if (!hasShow.current) {
      hasShow.current = true;
    }
    portal = (
      ReactDOM.createPortal(
        Modal,
        document.body
      )
    );
  } else if (!visible && !hasShow.current) {
    portal = null;
  }

  return portal;
};
```

如下：

- 初始情况下，visible为false。通过`useRef`设置一个`hasShow`属性，初始值为false，用来表示弹框是否是第一次展示。如果visible为false，并且是第一次展示，则渲染null。
- 如果visible变为true，则将`hasShow`置为true，表示已经展示过。此时返回`React.createPortal`，向body下插入Modal
- 此时，当visible再次从true变为false时，不再返回null，相反，还是返回`React.createPortal`，只不过此时内部被增加一个hidden类，针对这个类设置`display:none`，从而起到隐藏作用
- 再当visible从false变为true时，则可以仍然使用`React.createPortal`,只不过去掉`hidden`类。从而使插入Modal的body不用重复地被插入移除。



