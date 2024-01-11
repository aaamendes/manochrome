class MANochrome {
  constructor(options={}) {
    this.html = document.body;
    this.generator = (typeof(options.generator) === "string") ? options.generator : "pod2html";
    this.options = options;
    this.headers = null;
    this.index = null;
    this.index_links = null;
    this.navigation = null;
    this.navigation_active_css_class = "nav-link-active";
    this.navi_open = true;
    this.windowMaxWidth = 430;

    this.build_index()
      .then((resp) => this.separate_index_content())
      .then((resp) => this.prettify_navigation())
      .then((resp) => { return this.sort_headers(); })
      .then((resp) => { 
        this.headers = resp;

        this.insert_open_close()
          .then(this.insert_links())
          .then(this.insert_logo())
          .then(this.set_mobile())
          .then(this.set_options());

      });
  }

  set_options() {
    return new Promise((resolve, reject) => {
      resolve(true);
    });
  }

  set_mobile() {
    return new Promise((resolve, reject) => {
      if (window.innerWidth <= this.windowMaxWidth) {
        document.getElementById("open-close-link").click();
      }
      resolve(true);
    });
  }

  navi_open_close(link) {
    let navi = document.getElementById("navigation");
    let content = document.getElementsByClassName("content")[0];
    if (this.navi_open) {
      navi.classList.add("navi-hide");
      content.classList.add("c-move-left");
      link.classList.add("rotate-180");
      this.navi_open = !this.navi_open;
    }
    else {
      navi.classList.remove("navi-hide");
      content.classList.remove("c-move-left");
      link.classList.remove("rotate-180");
      this.navi_open = !this.navi_open;
    }
  }

  insert_open_close() {
    return new Promise((resolve, reject) => {
      let ocwrapper = document.createElement("div");
      ocwrapper.classList.add("open-close-wrapper");
      ocwrapper.setAttribute("id", "open-close-wrapper");

      let a = document.createElement("a");
      a.setAttribute("id", "open-close-link");
      a.setAttribute("href", "#");
      a.textContent = "<";

      a.addEventListener("click", (e) => {
        e.preventDefault();
        this.navi_open_close(a);
      });

      ocwrapper.appendChild(a);

      let navi = document.getElementById("navigation");
      navi.insertBefore(ocwrapper, navi.firstChild);
    });
  }

  insert_links() {
    return new Promise((resolve, reject) => {
      if (typeof(this.options.links) !== "object") {
        resolve(false);
        return;
      }
      let wrapper = document.createElement("div");
      wrapper.setAttribute("id", "links-wrapper");

      let h2 = document.createElement("h2");
      h2.textContent = "🔗 LINKS";
      let ul = document.createElement("ul")

      this.options.links.map((item, i) => {
        let li = document.createElement("li");
        let a = document.createElement("a");
        a.innerHTML = item.html;
        a.setAttribute("href", item.url);
        a.setAttribute("target", "_blank");
        li.appendChild(a);
        ul.appendChild(li);
      });

      wrapper.appendChild(h2);
      wrapper.appendChild(ul);

      let navi = document.getElementById("navigation");
      navi.appendChild(wrapper);

      resolve(true);
    });
  }

  insert_logo() {
    return new Promise((resolve, reject) => {
      if (typeof(this.options.logo_path) !== "string") {
        resolve(false);
        return;
      }

      let navigation_node = document.getElementById("navigation");
      let img = document.createElement("img");
      img.setAttribute("src", this.options.logo_path);
      img.style.width = "100%";

      navigation_node.insertBefore(img, navigation_node.firstChild);

      resolve(true);
    });
  }

  build_index() {
    return new Promise((resolve, reject) => {
      let msg = `method build_index() not implemented in class ${this.constructor.name}`
      console.warn(msg);
      resolve(msg);
    });
  }

  separate_index_content() {
    return new Promise((resolve, reject) => {

      this.body = document.body.cloneNode(true);
      this.wrapper = document.createElement("div");
      this.wrapper.classList.add("wrapper");

      this.content = document.createElement("div");
      this.content.classList.add("content");
      this.content.innerHTML = this.body.innerHTML;

      this.navigation = document.createElement("div");
      this.navigation.classList.add("navigation");
      this.navigation.setAttribute("id", "navigation");
      this.navigation.innerHTML = this.index.outerHTML;

      [
        this.navigation,
        this.content
      ].map((node, index) => {
        this.wrapper.appendChild(node);
      });

      document.body.innerHTML = this.wrapper.outerHTML;

      // Get the cloned index.
      this.index = document.getElementById("index");

      resolve("separate_index_content done");
    });
  }

  get_nav_index_by_string(str, get_num=0) {
    return new Promise((resolve, reject) => {
      for (let i = 0; i < this.index_links.length; i++) {
        if (this.index_links[i].innerHTML === str) {
          if (get_num === 0)
            resolve(this.index_links[i]);
          else
            resolve(i);

          return;
        }
      }
    });

    resolve(false);
    return;
  }

  async change_nav_on_scroll() {
    let offset_y = window.scrollY;
    let grace = 21;

    for (let i = 0; i < this.headers.length; i++) {
      let check_node = await this.get_nav_index_by_string(this.headers[i].innerHTML);

      if (offset_y >= (this.headers[i].offsetTop - grace)) {
        this.set_link_active(check_node);
      }

    }
  }

  set_link_active(node) {
    for (let i = 0; i < this.index_links.length; i++) {
      this.index_links[i].classList.remove(this.navigation_active_css_class);
    }

    node.classList.add(this.navigation_active_css_class);
  }

  async sort_headers() {
    let new_arr = [];
    for (let i = 0; i < this.headers.length; i++) {
      let link_index = await this.get_nav_index_by_string(this.headers[i].innerHTML, 1);
      new_arr[link_index] = this.headers[i];
    }

    return new_arr;
  }

  prettify_navigation() {
    return new Promise((resolve, reject) => {
      this.index_links = this.index.getElementsByTagName("a");

      for (let i = 0; i < this.index_links.length; i++) {
        this.index_links[i].addEventListener("click", (e) => {
          this.set_link_active(this.index_links[i]);
        });
      }

      this.set_link_active(this.index_links[0]);

      this.headers = Array.from(document.getElementsByTagName("h1"))
      this.headers = this.headers.concat(Array.from(document.getElementsByTagName("h2")));
      this.headers = this.headers.concat(Array.from(document.getElementsByTagName("h3")));
      this.headers = this.headers.concat(Array.from(document.getElementsByTagName("h4")));

      window.addEventListener("scroll", (e) => {
        this.change_nav_on_scroll();
      });

      resolve("prettify_navigation done");
    });
  }

  /*
   * HTML generated by pod2html has an UL with id "index".
   */
  static has_index_id() {
    return (document.getElementById("index") !== null) ? (
      (document.getElementById("index").tagName === "UL") ? true : false
    ) : false;
  }
  /*
   * So far in development, we only have pod2html.
   */
  static determine_generator() {
    const gen_try = document.head.querySelector(
      'meta[name="generator"]'
    );

    return (gen_try === null) ? "pod2html" :
      (
        (gen_try.content.includes("groff")) ? "groff" : gen_try.content
      )
  }
}

class MANochrome_pod extends MANochrome {
  constructor(options={}) {
    super(options);
  }

  /*
   * Index is already there.
   * Clone Node (<UL>) and remove original.
   */
  build_index() {
    return new Promise((resolve, reject) => {
      const index = document.getElementById("index");
      this.index = index.cloneNode(true);
      index.remove();
      resolve("build_index done");
    });
  }
}

/*
 * TODO
 * This is experimental.
 */
class MANochrome_groff extends MANochrome {
  constructor(generator) {
    super(generator);
  }

  build_index() {
    let ul = document.createElement("ul");
    ul.setAttribute("id", "index");
    let delete_arr = [];

    return new Promise((resolve, reject) => {
      let next_link = document.getElementsByTagName("h1")[0];
      let i = 0;
      while (next_link.nextElementSibling.tagName !== "HR") {
        if (next_link.nextElementSibling.tagName !== "A") {
          next_link = next_link.nextElementSibling;
          delete_arr.push(next_link);
          continue;
        }

        let li = document.createElement("li");
        let a = next_link.nextElementSibling.cloneNode(true);
        li.appendChild(a);
        ul.appendChild(li);

        next_link = next_link.nextElementSibling;
        delete_arr.push(next_link);
        i++;
      }

      /*
       * Set this.index.
       */
      this.index = ul;

      delete_arr.map((node, i) => {
        node.remove();
      });

      /* 
       * Remove HR.
       */
      const hr = document.getElementsByTagName("h1")[0].nextElementSibling;

      if (hr.tagName === "HR")
        hr.remove();

      resolve("build_index done");
    });
  }
}
