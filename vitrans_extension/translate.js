// API_ENDPOINT = "https://quo4tmzn5.execute-api.ap-southeast-1.amazonaws.com/default/en_to_vi_translation";
API_ENDPOINT = "https://quo4tmzjn5.execute-api.ap-southeast-1.amazonaws.com/default/en_to_vi_translation";
QUEUE_EXEC_THRESHOLD = 80;

class Queue {
  constructor() {
    this.elements = {};
    this.head = 0;
    this.tail = 0;
    }
  enqueue(element) {
    this.elements[this.tail] = element;
    this.tail++;
  }
  dequeue() {
    const item = this.elements[this.head];
    delete this.elements[this.head];
    this.head++;
    return item;
  }
  peek() {
    return this.elements[this.head];
  }
  get length() {
    return this.tail - this.head;
  }
  get isEmpty() {
    return this.length === 0;
  }
}

class TranslationManager {
  constructor() {
    this.pendingQueue = new Queue();
    this.translatableNodeNames = ["TEXTAREA", "PRE", "CODE"];
  }

  cleanText(text) {
    let cleanedText = text.replace(/[^a-zA-Z0-9]+/g, "");
    return cleanedText;
  }

  /**
   * Pick QUEUE_EXEC_THRESHOLD item from queue and translate them
   * Put them back to queue if failure
   */
  async translateBatch() {
    let translateNodes = [];
    for (let i = 0 ; i < QUEUE_EXEC_THRESHOLD ; i++) {
      if (this.pendingQueue.length == 0)
        break;
      let nodeInQueue = this.pendingQueue.dequeue();
      translateNodes.push(nodeInQueue);
      // nodeInQueue.textContent = "TRANS";
    }

    let headers = new Headers();
    headers.append("Authorization", "allow");
    headers.append("Content-Type", "text/plain");

    let body = JSON.stringify({
      "batch_text": translateNodes.map(item => item.textContent)
    });

    var requestOptions = {
      method: 'POST',
      headers: headers,
      body: body,
      redirect: 'follow'
    };

    await fetch(API_ENDPOINT, requestOptions)
      .then(response => response.text())
      .then(result => {
        result = JSON.parse(result);
        // console.log(requestOptions.body);
        // console.log(result);
        let translated_texts = result.batch_translated_text;
        for (let idx = 0 ; idx < translateNodes.length ; idx++) {
          translateNodes[idx].textContent = translated_texts[idx];
        }
      }).catch(error => {
        console.log('error', error);
        // for (let node of translateNodes) {
        //   this.pendingQueue.enqueue(node);
        // }
      });
  }

  /**
   * Determine if the node can be translated or not
   * @param {String} nodeName
   */
  translatableNode(nodeName) {
    // return true;
    // console.log(this.translatableNodeNames, nodeName, this.translatableNodeNames.includes(nodeName));
    return !this.translatableNodeNames.includes(nodeName);
  }

  /**
   * Substitutes emojis into text nodes.
   * If the node contains more than just text (ex: it has child nodes),
   * call replaceText() on each of its children.
   *
   * @param  {Node} node    - The target DOM Node.
   * @return {void}         - Note: the emoji substitution is done inline.
   */
  async scanNodes(node) {
    // Skip textarea nodes due to the potential for accidental submission
    // of substituted emoji where none was intended.
    if (node.parentNode && !this.translatableNode(node.parentNode.nodeName)) {
      return;
    }

    if (node.nodeType === Node.TEXT_NODE) {
      // This node only contains text

      // Because DOM manipulation is slow, we don't want to keep setting
      // textContent after every replacement. Instead, manipulate a copy of
      // this string outside of the DOM and then perform the manipulation
      // once, at the end.
      let content = node.textContent;

      // Now that all the replacements are done, perform the DOM manipulation.
      // node.textContent = content;

      let cleanedContent = this.cleanText(content);
      if (cleanedContent !== "") {
          this.pendingQueue.enqueue(node);
          if (this.pendingQueue.length > QUEUE_EXEC_THRESHOLD) {
            console.log("Translating batch");
            await this.translateBatch();
            console.log("DONE BATCH");
          }
      }
    }
    else {
      // This node contains more than just text, call replaceText() on each
      // of its children.
      for (let i = 0; i < node.childNodes.length; i++) {
        await this.scanNodes(node.childNodes[i]);
      }    
    }
  }

  async translateFullPage() {
    // Start the recursion from the body tag.
    await this.scanNodes(document.body);
    await this.translateBatch();
    console.log("DONE ALL");

    // Now monitor the DOM for additions and substitute into new nodes.
    // @see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver.
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
          // This DOM change was new nodes being added. Run our substitution
          // algorithm on each newly added node.
          for (let i = 0; i < mutation.addedNodes.length; i++) {
            const newNode = mutation.addedNodes[i];
            this.scanNodes(newNode);
            this.translateBatch();
          }
        }
      });
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

manager = new TranslationManager()
manager.translateFullPage();