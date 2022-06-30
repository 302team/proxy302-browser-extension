  function locale_text(key, default_value) {
    var value = chrome.i18n.getMessage(key);
    if(!value)
      return default_value;
    return value;
  }
  
  function locale_text_placeholder(node) {
    var placeholder = node.placeholder;
    if (!placeholder || placeholder == "") return;
    placeholder = placeholder.replace(/__MSG_(\w+)__/g, 
      function(w,w2,w3,w4) {
        return locale_text(w2, w2.replace('_', " "));
      }  
    );
    node.placeholder = placeholder;
  }

  function locale_text_node(textNode) {
    var value = textNode.nodeValue;
    value = value.replace(/__MSG_(\w+)__/g, 
      function(w,w2,w3,w4) {
        return locale_text(w2, w2.replace('_', " "));
      }  
    );
  
    textNode.nodeValue = value;
  }
  
  function extract_document(e) {
    var childNodes = e.childNodes;
    for (var i = 0; i < childNodes.length; i ++) {
      var c = childNodes[i];
      switch(c.nodeType) {
      case 1:
        locale_text_placeholder(c);
        extract_document(c);
        break;
      case 3:
        locale_text_node(c);
        break;
      }
    }
  }
  
  function addEvent(obj, evtName, fnHandler, useCapture) {
      if(obj.addEventListener) {
        obj.addEventListener(evtName, fnHandler, !!useCapture);
      } else if(obj.attachEvent) {
        obj.attachEvent('on'+evtName, fnHandler);
      } else {
        oTarget["on" + evtName] = fnHandler;
      }
  };
  
  addEvent(window, 'load', function() {
    extract_document(document.getElementsByTagName('html')[0]);
  });
  