// --------------------------------------
// 
//    _  _ _/ .  _  _/ /_ _  _  _        
//   /_|/_ / /|//_  / / //_ /_// /_/     
//   http://activetheory.net     _/      
// 
// --------------------------------------
//   8/27/14 11:30
// --------------------------------------

window.Global = new Object();
window.getURL = function(a, b) {
    if (!b) {
        b = "_blank"
    }
    window.open(a, b)
};
if (typeof(console) === "undefined") {
    window.console = {};
    console.log = console.error = console.info = console.debug = console.warn = console.trace = function() {}
}
if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = (function() {
        return window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(b, a) {
            window.setTimeout(b, 1000 / 60)
        }
    })()
}
Date.now = Date.now || function() {
    return +new Date
};
window.Class = function(b, c) {
    var e = this || window;
    var d = b.toString();
    var a = d.match(/function ([^\(]+)/)[1];
    c = (c || "").toLowerCase();
    b.prototype.__call = function() {
        if (this.events) {
            this.events.scope(this)
        }
    };
    if (!c) {
        e[a] = b
    } else {
        if (c == "static") {
            e[a] = new b()
        } else {
            if (c == "singleton") {
                e[a] = (function() {
                    var g = new Object();
                    var f;
                    g.instance = function() {
                        if (!f) {
                            f = new b()
                        }
                        return f
                    };
                    return g
                })()
            }
        }
    }
};
window.Inherit = function(f, a, d) {
    if (typeof d === "undefined") {
        d = f
    }
    var c = new a(d, true);
    var b = {};
    for (var e in c) {
        f[e] = c[e];
        b[e] = c[e]
    }
    if (f.__call) {
        f.__call()
    }
    Render.nextFrame(function() {
        for (e in c) {
            if ((f[e] && b[e]) && f[e] !== b[e]) {
                f["_" + e] = b[e]
            }
        }
        c = b = null
    })
};
window.Interface = function(b, a) {
    Render.nextFrame(function() {
        var c = new a();
        for (var e in c) {
            if (typeof b[e] === "undefined") {
                throw "Interface Error: Missing Property: " + e + " ::: " + a
            } else {
                var d = typeof c[e];
                if (typeof b[e] != d) {
                    throw "Interface Error: Property " + e + " is Incorrect Type ::: " + a
                }
            }
        }
        c = null
    })
};
window.Namespace = function(b, a) {
    if (!a) {
        window[b] = {
            Class: window.Class
        }
    } else {
        a.Class = window.Class
    }
};
Class(function HydraObject(c, d, b, g) {
    var f = this;
    var h;
    this._events = {};
    this._children = new LinkedList();
    this.__useFragment = g;
    (function() {
        e()
    })();

    function e() {
        if (c && typeof c !== "string") {
            f.div = c
        } else {
            var k = c ? c.charAt(0) : null;
            var j = c ? c.slice(1) : null;
            if (k != "." && k != "#") {
                j = c;
                k = "."
            }
            if (!b) {
                f._type = d || "div";
                f.div = document.createElement(f._type);
                if (k) {
                    if (k == "#") {
                        f.div.id = j
                    } else {
                        f.div.className = j
                    }
                }
            } else {
                if (k != "#") {
                    throw "Hydra Selectors Require #ID"
                }
                f.div = document.getElementById(j)
            }
        }
        f.div.hydraObject = f
    }

    function i(l, j, k) {
        if (l[k == "." ? "className" : "id"] == j) {
            return l
        }
        return false
    }

    function a() {
        if (!h) {
            return false
        }
        f.div.appendChild(h);
        h = null
    }
    this.addChild = this.add = function(k) {
        var j = this.div;
        if (this.__useFragment) {
            if (!h) {
                h = document.createDocumentFragment();
                Render.nextFrame(a)
            }
            j = h
        }
        if (k.element && k.element instanceof HydraObject) {
            j.appendChild(k.element.div);
            this._children.push(k.element);
            k.element._parent = this
        } else {
            if (k.container && k.container instanceof HydraObject) {
                j.appendChild(k.container.div);
                this._children.push(k.container);
                k.container._parent = this
            } else {
                if (k.div) {
                    j.appendChild(k.div);
                    this._children.push(k);
                    k._parent = this
                } else {
                    if (k.nodeName) {
                        j.appendChild(k)
                    }
                }
            }
        }
        return this
    };
    this.clone = function() {
        return $(this.div.cloneNode(true))
    };
    this.create = function(j, k) {
        var l = $(j, k);
        this.addChild(l);
        return l
    };
    this.empty = function() {
        var j = this._children.start();
        while (j) {
            if (j && j.remove) {
                j.remove()
            }
            j = this._children.next()
        }
        this.div.innerHTML = "";
        return this
    };
    this.parent = function() {
        return this._parent
    };
    this.children = function() {
        return this.div.children ? this.div.children : this.div.childNodes
    };
    this.removeChild = function(k, j) {
        if (!j) {
            try {
                this.div.removeChild(k.div)
            } catch (l) {}
        }
        this._children.remove(k)
    };
    this.remove = function(l) {
        this.stopTween();
        var j = this._parent;
        if (j && j.removeChild) {
            j.removeChild(this)
        }
        if (!l) {
            var k = this._children.start();
            while (k) {
                if (k && k.remove) {
                    k.remove()
                }
                k = this._children.next()
            }
            this._children.empty();
            Utils.nullObject(this)
        }
    }
});
Class(function Hydra() {
    var f = this;
    var d, b;
    var e = new Array();
    this.READY = false;
    (function() {
        a()
    })();

    function a() {
        if (!document || !window) {
            return setTimeout(a, 1)
        }
        if (window._NODE_) {
            return setTimeout(c, 1)
        }
        if (window.addEventListener) {
            f.addEvent = "addEventListener";
            f.removeEvent = "removeEventListener";
            window.addEventListener("load", c, false)
        } else {
            f.addEvent = "attachEvent";
            f.removeEvent = "detachEvent";
            window.attachEvent("onload", c)
        }
    }

    function c() {
        if (window.removeEventListener) {
            window.removeEventListener("load", c, false)
        }
        for (var g = 0; g < e.length; g++) {
            e[g]()
        }
        e = null;
        f.READY = true;
        if (window.Main) {
            Hydra.Main = new window.Main()
        }
    }
    this.development = function(g) {
        if (!g) {
            clearInterval(d)
        } else {
            d = setInterval(function() {
                for (var k in window) {
                    if (k.strpos("webkit")) {
                        continue
                    }
                    var j = window[k];
                    if (typeof j !== "function" && k.length > 2) {
                        if (k.strpos("_ga") || k.strpos("_typeface_js")) {
                            continue
                        }
                        var i = k.charAt(0);
                        var h = k.charAt(1);
                        if (i == "_" || i == "$") {
                            if (h !== h.toUpperCase()) {
                                throw "Hydra Warning:: " + k + " leaking into global scope"
                            }
                        }
                    }
                }
            }, 1000)
        }
    };
    this.ready = function(g) {
        if (this.READY) {
            return g()
        }
        e.push(g)
    };
    this.$ = function(g, h, i) {
        return new HydraObject(g, h, i)
    };
    this.HTML = {};
    this.SHADERS = {};
    this.JSON = {};
    this.$.fn = HydraObject.prototype;
    window.$ = this.$
}, "Static");
Hydra.ready(function() {
    window.__window = $(window);
    window.__document = $(document);
    window.__body = $(document.getElementsByTagName("body")[0]);
    window.Stage = __body.create("#Stage");
    Stage.size("100%");
    Stage.__useFragment = true;
    Stage.width = window.innerWidth || document.documentElement.offsetWidth;
    Stage.height = window.innerHeight || document.documentElement.offsetHeight;
    (function() {
        var b = Date.now();
        var a;
        setTimeout(function() {
            var g = ["hidden", "msHidden", "webkitHidden"];
            var f, e;
            (function() {
                for (var h in g) {
                    if (document[g[h]] !== "undefined") {
                        f = g[h];
                        switch (f) {
                            case "hidden":
                                e = "visibilitychange";
                                break;
                            case "msHidden":
                                e = "msvisibilitychange";
                                break;
                            case "webkitHidden":
                                e = "webkitvisibilitychange";
                                break
                        }
                        return
                    }
                }
            })();
            if (typeof document[f] === "undefined") {
                if (Device.browser.ie) {
                    document.onfocus = c;
                    document.onblur = d
                } else {
                    window.onfocus = c;
                    window.onblur = d
                }
            } else {
                document.addEventListener(e, function() {
                    var h = Date.now();
                    if (h - b > 10) {
                        if (document[f] === false) {
                            c()
                        } else {
                            d()
                        }
                    }
                    b = h
                })
            }
        }, 250);

        function c() {
            if (a != "focus") {
                HydraEvents._fireEvent(HydraEvents.BROWSER_FOCUS, {
                    type: "focus"
                })
            }
            a = "focus"
        }

        function d() {
            if (a != "blur") {
                HydraEvents._fireEvent(HydraEvents.BROWSER_FOCUS, {
                    type: "blur"
                })
            }
            a = "blur"
        }
    })();
    window.onresize = function() {
        if (!Device.mobile) {
            Stage.width = window.innerWidth || document.documentElement.offsetWidth;
            Stage.height = window.innerHeight || document.documentElement.offsetHeight;
            HydraEvents._fireEvent(HydraEvents.RESIZE)
        }
    }
});
Class(function MVC() {
    Inherit(this, Events);
    var a = {};
    this.classes = {};

    function b(d, c) {
        a[c] = {};
        Object.defineProperty(d, c, {
            set: function(e) {
                if (a[c]) {
                    a[c].s.apply(d, [e])
                }
            },
            get: function() {
                if (a[c]) {
                    return a[c].g.apply(d)
                }
            }
        })
    }
    this.set = function(d, c) {
        if (!a[d]) {
            b(this, d)
        }
        a[d].s = c
    };
    this.get = function(d, c) {
        if (!a[d]) {
            b(this, d)
        }
        a[d].g = c
    };
    this.delayedCall = function(f, c, d) {
        var e = this;
        return setTimeout(function() {
            if (e.destroy) {
                f.apply(e, [d])
            }
        }, c || 0)
    };
    this.initClass = function(m, p, o, n, l, k, j, i) {
        var h = Utils.timestamp();
        this.classes[h] = new m(p, o, n, l, k, j, i);
        this.classes[h].parent = this;
        this.classes[h].__id = h;
        if (this.element && arguments[arguments.length - 1] !== null) {
            this.element.addChild(this.classes[h])
        }
        return this.classes[h]
    };
    this.destroy = function() {
        if (this.container) {
            Global[this.container.div.id.toUpperCase()] = null
        }
        for (var d in this.classes) {
            var c = this.classes[d];
            if (c.destroy) {
                c.destroy()
            }
        }
        this.classes = null;
        if (this.events) {
            this.events = this.events.destroy()
        }
        if (this.element && this.element.remove) {
            this.element = this.container = this.element.remove()
        }
        if (this.parent && this.parent.__destroyChild) {
            this.parent.__destroyChild(this.__id)
        }
        return Utils.nullObject(this)
    };
    this.__destroyChild = function(c) {
        this.classes[c] = null;
        delete this.classes[c]
    }
});
Class(function Model(a) {
    Inherit(this, MVC);
    Global[a.constructor.toString().match(/function ([^\(]+)/)[1].toUpperCase()] = {};
    this.__call = function() {
        this.events.scope(this);
        delete this.__call
    }
});
Class(function View(a) {
    Inherit(this, MVC);
    this.element = $("." + a.constructor.toString().match(/function ([^\(]+)/)[1]);
    this.element.__useFragment = true;
    this.css = function(b) {
        this.element.css(b);
        return this
    };
    this.transform = function(b) {
        this.element.transform(b || this);
        return this
    };
    this.tween = function(d, e, f, b, g, c) {
        return this.element.tween(d, e, f, b, g, c)
    }
});
Class(function Controller(a) {
    Inherit(this, MVC);
    a = a.constructor.toString().match(/function ([^\(]+)/)[1];
    this.element = this.container = $("#" + a);
    this.element.__useFragment = true;
    Global[a.toUpperCase()] = {};
    this.css = function(b) {
        this.container.css(b)
    }
});
Class(function Component() {
    Inherit(this, MVC);
    this.__call = function() {
        this.events.scope(this);
        delete this.__call
    }
});
Class(function Utils() {
    var d = this;
    if (typeof Float32Array == "undefined") {
        Float32Array = Array
    }

    function a(e) {
        e = parseInt(e, 10);
        if (isNaN(e)) {
            return "00"
        }
        e = Math.max(0, Math.min(e, 255));
        return "0123456789ABCDEF".charAt((e - e % 16) / 16) + "0123456789ABCDEF".charAt(e % 16)
    }

    function c(f, e) {
        return b(Math.random(), f, e)
    }

    function b(f, g, e) {
        return g + (e - g) * f
    }
    this.doRandom = function(f, e) {
        return Math.round(c(f - 0.5, e + 0.5))
    };
    this.headsTails = function(f, g) {
        var e = d.doRandom(0, 1);
        if (!e) {
            return f
        } else {
            return g
        }
    };
    this.toDegrees = function(e) {
        return e * (180 / Math.PI)
    };
    this.toRadians = function(e) {
        return e * (Math.PI / 180)
    };
    this.findDistance = function(h, g) {
        var f = g.x - h.x;
        var e = g.y - h.y;
        return Math.sqrt(f * f + e * e)
    };
    this.timestamp = function() {
        var e = Date.now() + d.doRandom(0, 99999);
        return e.toString()
    };
    this.rgbToHex = function(f, e, g) {
        return a(f) + a(e) + a(g)
    };
    this.hexToRGB = function(f) {
        var e = [];
        f.replace(/(..)/g, function(g) {
            e.push(parseInt(g, 16))
        });
        return e
    };
    this.getBackground = function(f) {
        var e = f.css("backgroundImage");
        if (e.length) {
            e = e.replace('("', "(");
            e = e.replace('")', ")");
            e = e.split("(");
            e = e[1].slice(0, -1)
        }
        return e
    };
    this.hitTestObject = function(k, j) {
        var f = k.x,
            o = k.y,
            p = k.width,
            l = k.height;
        var s = j.x,
            i = j.y,
            n = j.width,
            r = j.height;
        var e = f + p,
            m = o + l,
            q = s + n,
            g = i + r;
        if (s >= f && s <= e) {
            if (i >= o && i <= m) {
                return true
            } else {
                if (o >= i && o <= g) {
                    return true
                }
            }
        } else {
            if (f >= s && f <= q) {
                if (i >= o && i <= m) {
                    return true
                } else {
                    if (o >= i && o <= g) {
                        return true
                    }
                }
            }
        }
        return false
    };
    this.randomColor = function() {
        var e = "#" + Math.floor(Math.random() * 16777215).toString(16);
        if (e.length < 7) {
            e = this.randomColor()
        }
        return e
    };
    this.touchEvent = function(g) {
        var f = {};
        f.x = 0;
        f.y = 0;
        if (!g) {
            return f
        }
        if (g.touches || g.changedTouches) {
            if (g.changedTouches.length) {
                f.x = g.changedTouches[0].pageX;
                f.y = g.changedTouches[0].pageY
            } else {
                f.x = g.touches[0].pageX;
                f.y = g.touches[0].pageY
            }
        } else {
            f.x = g.pageX;
            f.y = g.pageY
        }
        return f
    };
    this.clamp = function(f, g, e) {
        return Math.min(Math.max(f, g), e)
    };
    this.nullObject = function(e) {
        if (e.destroy) {
            for (var f in e) {
                if (typeof e[f] !== "undefined") {
                    e[f] = null
                }
            }
        }
        return null
    };
    this.convertRange = function(f, i, g, k, h) {
        var j = (g - i);
        var e = (h - k);
        return (((f - i) * e) / j) + k
    };
    String.prototype.strpos = function(e) {
        return this.indexOf(e) != -1
    };
    String.prototype.clip = function(f, e) {
        return this.length > f ? this.slice(0, f) + e : this
    };
    String.prototype.capitalize = function() {
        return this.charAt(0).toUpperCase() + this.slice(1)
    }
}, "Static");
(function() {
    $.fn.text = function(a) {
        if (typeof a !== "undefined") {
            this.div.textContent = a;
            return this
        } else {
            return this.div.textContent
        }
    };
    $.fn.html = function(a) {
        if (typeof a !== "undefined") {
            this.div.innerHTML = a;
            return this
        } else {
            return this.div.innerHTML
        }
    };
    $.fn.hide = function() {
        this.div.style.display = "none";
        return this
    };
    $.fn.show = function() {
        this.div.style.display = "block";
        return this
    };
    $.fn.visible = function() {
        this.div.style.visibility = "visible";
        return this
    };
    $.fn.invisible = function() {
        this.div.style.visibility = "hidden";
        return this
    };
    $.fn.setZ = function(a) {
        this.div.style.zIndex = a;
        return this
    };
    $.fn.clearAlpha = function() {
        this.div.style.opacity = "";
        return this
    };
    $.fn.size = function(a, b, c) {
        if (typeof a === "string") {
            if (typeof b === "undefined") {
                b = "100%"
            } else {
                if (typeof b !== "string") {
                    b = b + "px"
                }
            }
            this.div.style.width = a;
            this.div.style.height = b
        } else {
            this.div.style.width = a + "px";
            this.div.style.height = b + "px";
            if (!c) {
                this.div.style.backgroundSize = a + "px " + b + "px"
            }
        }
        this.width = a;
        this.height = b;
        return this
    };
    $.fn.retinaSize = function(a, b) {
        if (typeof a === "string") {
            this.div.style.backgroundSize = a + " " + b
        } else {
            this.div.style.backgroundSize = a + "px " + b + "px"
        }
        return this
    };
    $.fn.mouseEnabled = function(a) {
        this.div.style.pointerEvents = a ? "auto" : "none";
        return this
    };
    $.fn.fontStyle = function(e, c, b, d) {
        var a = new Object();
        if (e) {
            a.fontFamily = e
        }
        if (c) {
            a.fontSize = c
        }
        if (b) {
            a.color = b
        }
        if (d) {
            a.fontStyle = d
        }
        this.css(a);
        return this
    };
    $.fn.bg = function(c, a, d, b) {
        if (!c) {
            return this
        }
        if (!c.strpos(".")) {
            this.div.style.backgroundColor = c
        } else {
            this.div.style.backgroundImage = "url(" + c + ")"
        } if (typeof a !== "undefined") {
            a = typeof a == "number" ? a + "px" : a;
            d = typeof d == "number" ? d + "px" : d;
            this.div.style.backgroundPosition = a + " " + d
        }
        if (b) {
            this.div.style.backgroundSize = "";
            this.div.style.backgroundRepeat = b
        }
        return this
    };
    $.fn.center = function(a, c) {
        var b = {};
        if (typeof a === "undefined") {
            b.left = "50%";
            b.top = "50%";
            b.marginLeft = -this.width / 2;
            b.marginTop = -this.height / 2
        } else {
            if (a) {
                b.left = "50%";
                b.marginLeft = -this.width / 2
            }
            if (c) {
                b.top = "50%";
                b.marginTop = -this.height / 2
            }
        }
        this.css(b);
        return this
    };
    $.fn.mask = function(b, a, e, c, d) {
        this.div.style[Device.styles.vendor + "Mask"] = (b.strpos(".") ? "url(" + b + ")" : b) + " no-repeat";
        return this
    };
    $.fn.css = function(d, c) {
        if (typeof c == "boolean") {
            skip = c;
            c = null
        }
        if (typeof d !== "object") {
            if (!c) {
                var b = this.div.style[d];
                if (typeof b !== "number") {
                    if (b.strpos("px")) {
                        b = Number(b.slice(0, -2))
                    }
                    if (d == "opacity") {
                        b = 1
                    }
                }
                if (!b) {
                    b = 0
                }
                return b
            } else {
                this.div.style[d] = c;
                return this
            }
        }
        TweenManager.clearCSSTween(this);
        for (var a in d) {
            var e = d[a];
            if (!(typeof e === "string" || typeof e === "number")) {
                continue
            }
            if (typeof e !== "string" && a != "opacity" && a != "zIndex") {
                e += "px"
            }
            this.div.style[a] = e
        }
        return this
    }
})();
Class(function CSS() {
    var g = this;
    var f, b, a;
    Hydra.ready(function() {
        b = "";
        f = document.createElement("style");
        f.type = "text/css";
        document.getElementsByTagName("head")[0].appendChild(f)
    });

    function d(j) {
        var i = j.match(/[A-Z]/);
        var k = i ? i.index : null;
        if (k) {
            var l = j.slice(0, k);
            var h = j.slice(k);
            j = l + "-" + h.toLowerCase()
        }
        return j
    }

    function e(j) {
        var i = j.match(/\-/);
        var l = i ? i.index : null;
        if (l) {
            var m = j.slice(0, l);
            var h = j.slice(l).slice(1);
            var k = h.charAt(0);
            h = h.slice(1);
            h = k.toUpperCase() + h;
            j = m + h
        }
        return j
    }

    function c() {
        f.innerHTML = b;
        a = false
    }
    this._read = function() {
        return b
    };
    this._write = function(h) {
        b = h;
        if (!a) {
            a = true;
            Render.nextFrame(c)
        }
    };
    this._toCSS = d;
    this.style = function(h, k) {
        var j = h + " {";
        for (var i in k) {
            var m = d(i);
            var l = k[i];
            if (typeof l !== "string" && i != "opacity") {
                l += "px"
            }
            j += m + ":" + l + "!important;"
        }
        j += "}";
        f.innerHTML += j
    };
    this.get = function(k, h) {
        var q = new Object();
        var n = f.innerHTML.split(k + " {");
        for (var m = 0; m < n.length; m++) {
            var o = n[m];
            if (!o.length) {
                continue
            }
            var p = o.split("!important;");
            for (var l in p) {
                if (p[l].strpos(":")) {
                    var r = p[l].split(":");
                    if (r[1].slice(-2) == "px") {
                        r[1] = Number(r[1].slice(0, -2))
                    }
                    q[e(r[0])] = r[1]
                }
            }
        }
        if (!h) {
            return q
        } else {
            return q[h]
        }
    };
    this.textSize = function(k) {
        var j = k.clone();
        j.css({
            position: "relative",
            cssFloat: "left",
            styleFloat: "left",
            marginTop: -99999,
            width: "",
            height: ""
        });
        __body.addChild(j);
        var i = j.div.offsetWidth;
        var h = j.div.offsetHeight;
        j.remove();
        return {
            width: i,
            height: h
        }
    };
    this.prefix = function(h) {
        return Device.styles.vendor == "" ? h[0].toLowerCase() + h.slice(1) : Device.styles.vendor + h
    }
}, "Static");
Class(function Device() {
    var b = this;
    this.agent = navigator.userAgent.toLowerCase();

    function a(f) {
        var e = document.createElement("div"),
            d = "Khtml ms O Moz Webkit".split(" "),
            c = d.length;
        if (f in e.style) {
            return true
        }
        f = f.replace(/^[a-z]/, function(g) {
            return g.toUpperCase()
        });
        while (c--) {
            if (d[c] + f in e.style) {
                return true
            }
        }
        return false
    }
    this.detect = function(d) {
        if (typeof d === "string") {
            d = [d]
        }
        for (var c = 0; c < d.length; c++) {
            if (this.agent.strpos(d[c])) {
                return true
            }
        }
        return false
    };
    this.mobile = ( !! ("ontouchstart" in window) && this.detect(["ios", "iphone", "ipad", "windows phone", "android", "blackberry"])) ? {} : false;
    if (this.mobile) {
        this.mobile.tablet = window.innerWidth > 1000 || window.innerHeight > 900;
        this.mobile.phone = !this.mobile.tablet
    }
    this.browser = new Object();
    this.browser.chrome = this.detect("chrome");
    this.browser.safari = !this.browser.chrome && this.detect("safari");
    this.browser.firefox = this.detect("firefox");
    this.browser.ie = (function() {
        if (b.detect("msie")) {
            return true
        }
        if (b.detect("trident") && b.detect("rv:")) {
            return true
        }
    })();
    this.browser.version = (function() {
        try {
            if (b.browser.chrome) {
                return Number(b.agent.split("chrome/")[1].split(".")[0])
            }
            if (b.browser.firefox) {
                return Number(b.agent.split("firefox/")[1].split(".")[0])
            }
            if (b.browser.safari) {
                return Number(b.agent.split("version/")[1].split(".")[0].charAt(0))
            }
            if (b.browser.ie) {
                if (b.detect("msie")) {
                    return Number(b.agent.split("msie ")[1].split(".")[0])
                }
                return Number(b.agent.split("rv:")[1].split(".")[0])
            }
        } catch (c) {
            return -1
        }
    })();
    this.vendor = (function() {
        if (b.browser.firefox) {
            return "moz"
        }
        if (b.browser.opera) {
            return "o"
        }
        if (b.browser.ie && b.browser.version >= 11) {
            return ""
        }
        if (b.browser.ie) {
            return "ms"
        }
        return "webkit"
    })();
    this.system = new Object();
    this.system.retina = window.devicePixelRatio > 1 ? true : false;
    this.system.webworker = typeof window.Worker !== "undefined";
    this.system.offline = typeof window.applicationCache !== "undefined";
    this.system.geolocation = typeof navigator.geolocation !== "undefined";
    this.system.pushstate = typeof window.history.pushState !== "undefined";
    this.system.webcam = !! (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
    this.system.language = window.navigator.userLanguage || window.navigator.language;
    this.system.webaudio = typeof window.webkitAudioContext !== "undefined" || typeof window.AudioContent !== "undefined";
    this.system.localStorage = typeof window.localStorage !== "undefined";
    this.system.fullscreen = typeof document[b.vendor + "CancelFullScreen"] !== "undefined";
    this.system.os = (function() {
        if (b.detect("mac os")) {
            return "mac"
        } else {
            if (b.detect("windows nt 6.3")) {
                return "windows8.1"
            } else {
                if (b.detect("windows nt 6.2")) {
                    return "windows8"
                } else {
                    if (b.detect("windows nt 6.1")) {
                        return "windows7"
                    } else {
                        if (b.detect("windows nt 6.0")) {
                            return "windowsvista"
                        } else {
                            if (b.detect("windows nt 5.1")) {
                                return "windowsxp"
                            } else {
                                if (b.detect("linux")) {
                                    return "linux"
                                }
                            }
                        }
                    }
                }
            }
        }
        return "undetected"
    })();
    this.media = new Object();
    this.media.audio = (function() {
        if ( !! document.createElement("audio").canPlayType) {
            return b.detect(["firefox", "opera"]) ? "ogg" : "mp3"
        } else {
            return false
        }
    })();
    this.media.video = (function() {
        var c = document.createElement("video");
        if ( !! c.canPlayType) {
            if (Device.mobile) {
                return "mp4"
            }
            if (b.browser.chrome) {
                return "mp4"
            }
            if (b.browser.firefox || b.browser.opera) {
                if (c.canPlayType('video/webm; codecs="vorbis,vp8"')) {
                    return "webm"
                }
                return "ogv"
            }
            return "mp4"
        } else {
            return false
        }
    })();
    this.graphics = new Object();
    this.graphics.webgl = (function() {
        try {
            return !!window.WebGLRenderingContext && !! document.createElement("canvas").getContext("experimental-webgl")
        } catch (c) {}
    })();
    this.graphics.canvas = (function() {
        var c = document.createElement("canvas");
        return c.getContext ? true : false
    })();
    this.styles = new Object();
    this.styles.filter = a("filter") && !b.browser.firefox;
    this.styles.shader = b.browser.chrome;
    this.styles.vendor = (function() {
        if (b.browser.firefox) {
            return "Moz"
        }
        if (b.browser.opera) {
            return "O"
        }
        if (b.browser.ie && b.browser.version >= 11) {
            return ""
        }
        if (b.browser.ie) {
            return "ms"
        }
        return "Webkit"
    })();
    this.styles.vendorTransition = this.styles.vendor.length ? this.styles.vendor + "Transition" : "transition";
    this.styles.vendorTransform = this.styles.vendor.length ? this.styles.vendor + "Transform" : "transform";
    this.tween = new Object();
    this.tween.transition = a("transition");
    this.tween.css2d = a("transform");
    this.tween.css3d = a("perspective");
    this.tween.complete = (function() {
        if (b.browser.firefox || b.browser.ie) {
            return "transitionend"
        }
        if (b.browser.opera) {
            return "oTransitionEnd"
        }
        return "webkitTransitionEnd"
    })();
    this.openFullscreen = function(c) {
        c = c || __body;
        if (c && b.system.fullscreen) {
            if (c == __body) {
                c.css({
                    top: 0
                })
            }
            c.div[b.vendor + "RequestFullScreen"]()
        }
    };
    this.closeFullscreen = function() {
        if (b.system.fullscreen) {
            document[b.vendor + "CancelFullScreen"]()
        }
    };
    this.getFullscreen = function() {
        return document[b.vendor + "IsFullScreen"]
    }
}, "Static");
Class(function Storage() {
    var d = this;
    var c;
    (function() {
        a()
    })();

    function a() {
        if (window.localStorage) {
            try {
                window.localStorage.test = 1;
                window.localStorage.removeItem("test");
                c = true
            } catch (f) {
                c = false
            }
        } else {
            c = false
        }
    }

    function b(i, j, f) {
        var g;
        if (arguments.length > 1 && (j === null || typeof j !== "object")) {
            g = new Object();
            g.path = "/";
            g.expires = f || 1;
            if (j === null) {
                g.expires = -1
            }
            if (typeof g.expires === "number") {
                var l = g.expires,
                    h = g.expires = new Date();
                h.setDate(h.getDate() + l)
            }
            return (document.cookie = [encodeURIComponent(i), "=", g.raw ? String(j) : encodeURIComponent(String(j)), g.expires ? "; expires=" + g.expires.toUTCString() : "", g.path ? "; path=" + g.path : "", g.domain ? "; domain=" + g.domain : "", g.secure ? "; secure" : ""].join(""))
        }
        g = j || {};
        var e, k = g.raw ? function(m) {
                return m
            } : decodeURIComponent;
        return (e = new RegExp("(?:^|; )" + encodeURIComponent(i) + "=([^;]*)").exec(document.cookie)) ? k(e[1]) : null
    }
    this.setCookie = function(f, g, e) {
        b(f, g, e)
    };
    this.getCookie = function(e) {
        return b(e)
    };
    this.set = function(e, f) {
        if (typeof f === "object") {
            f = JSON.stringify(f)
        }
        if (c) {
            if (typeof f === "null") {
                window.localStorage.removeItem(e)
            } else {
                window.localStorage[e] = f
            }
        } else {
            b(e, f, 365)
        }
    };
    this.get = function(e) {
        var g;
        if (c) {
            g = window.localStorage[e]
        } else {
            g = b(e)
        } if (g) {
            var f;
            if (g.charAt) {
                f = g.charAt(0)
            }
            if (f == "{" || f == "[") {
                g = JSON.parse(g)
            }
        }
        return g
    }
}, "Static");
Class(function DynamicObject(a) {
    var c;
    for (var b in a) {
        this[b] = a[b]
    }
    this.tween = function(f, g, h, e, i, d) {
        if (typeof e !== "number") {
            d = i;
            i = e;
            e = 0
        }
        this.stopTween();
        if (typeof d !== "function") {
            d = null
        }
        if (typeof i !== "function") {
            i = null
        }
        c = TweenManager.tween(this, f, g, h, e, d, i);
        return c
    };
    this.stopTween = function() {
        if (c && c.stop) {
            c.stop()
        }
    };
    this.pause = function() {
        if (c && c.pause) {
            c.pause()
        }
    };
    this.resume = function() {
        if (c && c.resume) {
            c.resume()
        }
    };
    this.copy = function() {
        var e = new DynamicObject();
        for (var d in this) {
            if (typeof this[d] !== "function" && typeof this[d] !== "object") {
                e[d] = this[d]
            }
        }
        return e
    };
    this.clear = function() {
        for (var d in this) {
            if (typeof this[d] !== "function") {
                delete this[d]
            }
        }
        return this
    }
});
Class(function ObjectPool(b, d) {
    Inherit(this, Component);
    var c = this;
    var a = [];
    this.limit = Math.round(d * 1.25);
    (function() {
        if (b) {
            d = d || 10;
            b = b || Object;
            for (var e = 0; e < d; e++) {
                a.push(new b())
            }
        }
    })();
    this.get = function() {
        if (!a.length && a.length < c.limit) {
            a.push(new b())
        }
        return a.shift()
    };
    this.empty = function() {
        a = []
    };
    this.put = function(e) {
        if (e) {
            a.push(e)
        }
    };
    this.insert = function(f) {
        if (typeof f.push === "undefined") {
            f = [f]
        }
        for (var e = 0; e < f.length; e++) {
            a.push(f[e])
        }
    };
    this.destroy = function() {
        for (var e = 0; e < a.length; e++) {
            if (a[e].destroy) {
                a[e].destroy()
            }
        }
        a = null;
        return this._destroy()
    }
});
Class(function LinkedList() {
    var a = LinkedList.prototype;
    this.length = 0;
    this.first = null;
    this.last = null;
    this.current = null;
    a.push = function(b) {
        if (this.first === null) {
            b.__prev = b;
            b.__next = b;
            this.first = b;
            this.last = b
        } else {
            b.__prev = this.last;
            b.__next = this.first;
            this.last.__next = b;
            this.last = b
        }
        this.length++
    };
    a.remove = function(b) {
        if (this.length > 1 && b.__prev) {
            b.__prev.__next = b.__next;
            b.__next.__prev = b.__prev;
            if (b == this.first) {
                this.first = b.__next
            }
            if (b == this.last) {
                this.last = b.__prev
            }
        } else {
            this.first = null;
            this.last = null
        }
        b.__prev = null;
        b.__next = null;
        this.length--
    };
    a.empty = function() {
        this.length = 0;
        this.first = null;
        this.last = null;
        this.current = null
    };
    a.start = function(b) {
        b = b || this;
        b.current = this.first;
        return b.current
    };
    a.next = function(b) {
        b = b || this;
        if (!b.current || !b.current.__next) {
            return false
        }
        b.current = b.current.__next;
        if (b.current == b.current.__next || b.current == b.current.__prev) {
            b.current = null
        }
        return b.current
    };
    a.destroy = function() {
        Utils.nullObject(this);
        return null
    }
});
Class(function Pact() {
    var a = this;
    Namespace("Pact", this);
    (function() {})();
    this.create = function() {
        return new this.Emitter(arguments)
    };
    this.batch = function() {
        return new this.Batch()
    }
}, "Static");
Pact.Class(function Emitter(e) {
    var g = this;
    var a, d, f;
    var c;
    this._fire = function() {
        if (c) {
            return
        }
        c = true;
        var h = arguments;
        var i = false;
        Render.nextFrame(function() {
            if (f || d) {
                var k = h[0];
                var j = h[1];
                if (k instanceof Error) {
                    if (f) {
                        f.apply(g, [k])
                    }
                    i = true
                } else {
                    if (j instanceof Error) {
                        if (f) {
                            f.apply(g, [j])
                        }
                        i = true
                    } else {
                        if (!k && j && d) {
                            d.apply(g, [j]);
                            i = true
                        }
                        if (!j && k && d) {
                            d.apply(g, [k]);
                            i = true
                        }
                    }
                }
            }
            if (!i && a) {
                a.apply(g, h)
            }
        })
    };
    this.exec = function() {
        b(arguments);
        return this
    };
    this.then = function(h) {
        a = h;
        return this
    };
    this.error = function(h) {
        f = h;
        return this
    };
    this.success = function(h) {
        d = h;
        return this
    };

    function b(l) {
        var h = [];
        var k = l[0];
        for (var j = 1; j < l.length; j++) {
            h.push(l[j])
        }
        h.push(g._fire);
        k.apply(k, h)
    }
    if (e.length) {
        b(e)
    }
});
Pact.Class(function Batch() {
    Inherit(this, Events);
    var e = this;
    var g = 0;
    var a = [];
    var i = [];
    var j = [];
    var c = [];
    this.push = function(k) {
        k.then(h).error(d).success(f);
        c.push(k)
    };

    function f() {
        this.data = arguments;
        i.push(this);
        b()
    }

    function d() {
        this.data = arguments;
        j.push(this);
        b()
    }

    function h() {
        this.data = arguments;
        a.push(this);
        b()
    }

    function b() {
        g++;
        if (g == c.length) {
            e.events.fire(HydraEvents.COMPLETE, {
                complete: a,
                success: i,
                error: j
            })
        }
    }
});
Class(function HydraEvents() {
    var b = [];
    var a = {};
    this.BROWSER_FOCUS = "hydra_focus";
    this.HASH_UPDATE = "hydra_hash_update";
    this.COMPLETE = "hydra_complete";
    this.PROGRESS = "hydra_progress";
    this.UPDATE = "hydra_update";
    this.LOADED = "hydra_loaded";
    this.END = "hydra_end";
    this.FAIL = "hydra_fail";
    this.SELECT = "hydra_select";
    this.ERROR = "hydra_error";
    this.READY = "hydra_ready";
    this.RESIZE = "hydra_resize";
    this.CLICK = "hydra_click";
    this.HOVER = "hydra_hover";
    this.MESSAGE = "hydra_message";
    this.ORIENTATION = "orientation";
    this.BACKGROUND = "background";
    this.BACK = "hydra_back";
    this.PREVIOUS = "hydra_previous";
    this.NEXT = "hydra_next";
    this.RELOAD = "hydra_reload";
    this._checkDefinition = function(c) {
        if (typeof c == "undefined") {
            throw "Undefined event"
        }
    };
    this._addEvent = function(f, g, c) {
        if (this._checkDefinition) {
            this._checkDefinition(f)
        }
        var d = new Object();
        d.evt = f;
        d.object = c;
        d.callback = g;
        b.push(d)
    };
    this._removeEvent = function(c, e) {
        if (this._checkDefinition) {
            this._checkDefinition(c)
        }
        for (var d = b.length - 1; d > -1; d--) {
            if (b[d].evt == c && b[d].callback == e) {
                b[d] = null;
                b.splice(d, 1)
            }
        }
    };
    this._destroyEvents = function(c) {
        for (var d = b.length - 1; d > -1; d--) {
            if (b[d].object == c) {
                b[d] = null;
                b.splice(d, 1)
            }
        }
    };
    this._fireEvent = function(c, f) {
        if (this._checkDefinition) {
            this._checkDefinition(c)
        }
        var e = true;
        f = f || a;
        f.cancel = function() {
            e = false
        };
        for (var d = 0; d < b.length; d++) {
            if (b[d].evt == c) {
                if (e) {
                    b[d].callback(f)
                } else {
                    return false
                }
            }
        }
    };
    this._consoleEvents = function() {
        console.log(b)
    };
    this.createLocalEmitter = function(d) {
        var c = new HydraEvents();
        d.addEvent = c._addEvent;
        d.removeEvent = c._removeEvent;
        d.fireEvent = c._fireEvent
    }
}, "Static");
Class(function Events(c) {
    this.events = {};
    var b = {};
    var a = {};
    this.events.subscribe = function(d, e) {
        HydraEvents._addEvent(d, !! e._fire ? e._fire : e, c);
        return e
    };
    this.events.unsubscribe = function(d, e) {
        HydraEvents._removeEvent(d, !! e._fire ? e._fire : e)
    };
    this.events.fire = function(d, f, e) {
        f = f || a;
        HydraEvents._checkDefinition(d);
        if (b[d]) {
            f.target = f.target || c;
            b[d](f);
            f.target = null
        } else {
            if (!e) {
                HydraEvents._fireEvent(d, f)
            }
        }
    };
    this.events.add = function(d, e) {
        HydraEvents._checkDefinition(d);
        b[d] = !! e._fire ? e._fire : e;
        return e
    };
    this.events.remove = function(d) {
        HydraEvents._checkDefinition(d);
        if (b[d]) {
            delete b[d]
        }
    };
    this.events.bubble = function(e, d) {
        HydraEvents._checkDefinition(d);
        var f = this;
        e.events.add(d, function(g) {
            f.fire(d, g)
        })
    };
    this.events.scope = function(d) {
        c = d
    };
    this.events.destroy = function() {
        HydraEvents._destroyEvents(c);
        b = null;
        return null
    }
});
Class(function PushState(a) {
    var b = this;
    if (typeof a !== "boolean") {
        a = window.location.href.strpos("local") || window.location.href.charAt(0) == "1"
    }
    this.locked = false;
    this.dispatcher = new StateDispatcher(a);
    this.getState = function() {
        return this.dispatcher.getState()
    };
    this.setState = function(c) {
        this.dispatcher.setState(c)
    };
    this.setTitle = function(c) {
        this.dispatcher.setTitle(c)
    };
    this.lock = function() {
        this.locked = true;
        this.dispatcher.lock()
    };
    this.unlock = function() {
        this.locked = false;
        this.dispatcher.unlock()
    };
    this.setPathRoot = function(c) {
        this.dispatcher.setPathRoot(c)
    }
});
Class(function StateDispatcher(g) {
    Inherit(this, Events);
    var f = this;
    var i, a;
    var d = "/";
    this.locked = false;
    (function() {
        b();
        i = c();
        a = i
    })();

    function b() {
        if (!Device.system.pushstate || g) {
            if (Device.detect(["msie 7", "msie 8", "firefox/3", "safari/4"])) {
                setInterval(function() {
                    var j = c();
                    if (j != a) {
                        h(j)
                    }
                }, 300)
            } else {
                window.addEventListener("hashchange", function() {
                    h(c())
                }, false)
            }
        } else {
            window.onpopstate = history.onpushstate = e
        }
    }

    function c() {
        if (!Device.system.pushstate || g) {
            var j = window.location.hash;
            j = j.slice(3);
            return String(j)
        } else {
            var k = location.pathname.toString();
            k = d != "/" ? k.split(d)[1] : k.slice(1);
            k = k || "";
            return k
        }
    }

    function e() {
        var j = location.pathname;
        if (!f.locked && j != a) {
            j = d != "/" ? j.split(d)[1] : j.slice(1);
            j = j || "";
            a = j;
            f.events.fire(HydraEvents.UPDATE, {
                value: j,
                split: j.split("/")
            })
        } else {
            if (j != a) {
                if (a) {
                    window.history.pushState(null, null, d + j)
                }
            }
        }
    }

    function h(j) {
        if (!f.locked && j != a) {
            a = j;
            f.events.fire(HydraEvents.UPDATE, {
                value: j,
                split: j.split("/")
            })
        } else {
            if (j != a) {
                if (a) {
                    window.location.hash = "!/" + a
                }
            }
        }
    }
    this.getState = function() {
        return c()
    };
    this.setPathRoot = function(j) {
        if (j.charAt(0) == "/") {
            d = j
        } else {
            d = "/" + j
        }
    };
    this.setState = function(j) {
        if (!Device.system.pushstate || g) {
            if (j != a) {
                window.location.hash = "!/" + j;
                a = j
            }
        } else {
            if (j != a) {
                window.history.pushState(null, null, d + j);
                a = j
            }
        }
    };
    this.replaceState = function(j) {
        if (Device.mobile) {
            return
        }
        if (!Device.system.pushstate || g) {
            if (j != a) {
                window.location.hash = "!/" + j;
                a = j
            }
        } else {
            if (j != a) {
                window.history.replaceState(null, null, d + j);
                a = j
            }
        }
    };
    this.setTitle = function(j) {
        document.title = j
    };
    this.lock = function() {
        this.locked = true
    };
    this.unlock = function() {
        this.locked = false
    };
    this.forceHash = function() {
        g = true
    }
});
Class(function AssetLoader(j) {
    Inherit(this, Component);
    var c = this;
    var m = 0;
    var l = 0;
    var e, d, l;
    var f, g;
    (function() {
        e = new Array();
        g = new Array();
        k();
        setTimeout(h, 10)
    })();

    function k() {
        for (var o = 0; o < j.length; o++) {
            if (typeof j[o] !== "undefined") {
                m++;
                e.push(j[o])
            }
        }
    }

    function h() {
        d = Math.round(m * 0.5);
        for (var o = 0; o < d; o++) {
            a(e[o])
        }
    }

    function b() {
        if (e) {
            var r = [];
            for (var q = 0; q < e.length; q++) {
                var p = false;
                for (var o = 0; o < g.length; o++) {
                    if (g[o] == e[q]) {
                        p = true
                    }
                }
                if (!p) {
                    r.push(e[q])
                }
            }
            if (r.length) {
                console.log("AssetLoader Files Failed To Load:");
                console.log(r)
            }
        }
    }

    function a(s) {
        if (s) {
            var p = s.split("/");
            p = p[p.length - 1];
            var q = p.split(".");
            var r = q[q.length - 1].split("?")[0];
            switch (r) {
                case "html":
                    XHR.get(s, function(u) {
                        Hydra.HTML[q[0]] = u;
                        n(s)
                    }, "text");
                    break;
                case "js":
                case "php":
                case undefined:
                    var o = document.createElement("script");
                    o.type = "text/javascript";
                    o.src = s;
                    o.async = true;
                    __body.addChild(o);
                    XHR.get(s, function() {
                        setTimeout(function() {
                            n(s)
                        }, 100)
                    }, "text");
                    break;
                case "csv":
                case "json":
                    XHR.get(s, function(u) {
                        Hydra.JSON[q[0]] = u;
                        n(s)
                    }, r == "csv" ? "text" : null);
                    break;
                case "fs":
                case "vs":
                case "frag":
                case "vert":
                    XHR.get(s, function(u) {
                        Hydra.SHADERS[q[0] + "." + r] = u;
                        n(s)
                    }, "text");
                    break;
                default:
                    var t = new Image();
                    t.src = s;
                    t.onload = function() {
                        n(s)
                    };
                    break
            }
        }
    }

    function i() {
        if (l == d && l < m) {
            var p = d;
            d *= 2;
            for (var o = p; o < d; o++) {
                if (e[o]) {
                    a(e[o])
                }
            }
        }
    }

    function n(o) {
        if (e) {
            l++;
            c.events.fire(HydraEvents.PROGRESS, {
                percent: l / m
            });
            g.push(o);
            clearTimeout(f);
            i();
            if (l == m) {
                c.complete = true;
                Render.nextFrame(function() {
                    if (c.events) {
                        c.events.fire(HydraEvents.COMPLETE)
                    }
                })
            } else {
                f = setTimeout(b, 5000)
            }
        }
    }
    this.add = function(o) {
        m += o
    };
    this.trigger = function(o) {
        o = o || 1;
        for (var p = 0; p < o; p++) {
            n("trigger")
        }
    };
    this.destroy = function() {
        j = null;
        l = null;
        e = null;
        l = null;
        d = null;
        return this._destroy()
    }
});
Class(function Render() {
    var h = this;
    var n, e, k, g, a;
    var d = [];
    var j = [];
    var m = new LinkedList();
    var l = new LinkedList();
    var f = m;
    (function() {
        requestAnimationFrame(c);
        Hydra.ready(b)
    })();

    function b() {
        setTimeout(function() {
            if (!k) {
                window.requestAnimationFrame = function(o) {
                    setTimeout(o, 1000 / 60)
                };
                c()
            }
        }, 250)
    }
    Global.RENDER_INDEX = 0;

    function c() {
        var p = Date.now();
        var r = 0;
        var q = 60;
        if (k) {
            r = p - k;
            q = 1000 / r
        }
        k = p;
        h.FPS = q;
        for (var o = j.length - 1; o > -1; o--) {
            if (j[o]) {
                j[o](p, q, r)
            }
        }
        if (g && q < g) {
            for (o = d.length - 1; o > -1; o--) {
                if (d[o]) {
                    d[o](q)
                } else {
                    d.splice(o, 1)
                }
            }
        }
        if (f.length) {
            i()
        }
        requestAnimationFrame(c)
    }

    function i() {
        var o = f;
        f = f == m ? l : m;
        var p = o.start();
        while (p) {
            p();
            p = o.next()
        }
        o.empty()
    }
    this.startRender = function(q) {
        var p = true;
        var o = j.length - 1;
        if (j.indexOf(q) == -1) {
            j.push(q)
        }
    };
    this.stopRender = function(p) {
        var o = j.indexOf(p);
        if (o > -1) {
            j.splice(o, 1)
        }
    };
    this.addThreshold = function(o, p) {
        g = o;
        if (d.indexOf(p) == -1 && p) {
            d.push(p)
        }
    };
    this.removeThreshold = function(p) {
        if (p) {
            var o = d.indexOf(p);
            if (o > -1) {
                d.splice(o, 1)
            }
        } else {
            d = []
        }
        g = null
    };
    this.dump = function() {
        for (var o = 0; o < j.length; o++) {
            console.log(j[o])
        }
    };
    this.startTimer = function(o) {
        a = o || "Timer";
        if (console.time && !window._NODE_) {
            console.time(a)
        } else {
            e = Date.now()
        }
    };
    this.stopTimer = function() {
        if (console.time && !window._NODE_) {
            console.timeEnd(a)
        } else {
            console.log("Render " + a + ": " + (Date.now() - e))
        }
    };
    this.nextFrame = function(o) {
        f.push(o)
    };
    this.setupTween = function(o) {
        h.nextFrame(function() {
            h.nextFrame(o)
        })
    }
}, "Static");
Class(function Thread() {
    Inherit(this, Component);
    var g = this;
    var a, d, c;
    (function() {
        f();
        b()
    })();

    function f() {
        c = (function() {
            if (typeof Config !== "undefined") {
                return Config.PATH || ""
            }
            return ""
        })();
        d = new Object();
        a = new Worker(c + "assets/js/hydra/hydra-thread.js");
        var h = Utils.constructor.toString();
        h += "Utils = new Utils();";
        a.postMessage({
            code: h
        })
    }

    function b() {
        a.addEventListener("message", e)
    }

    function e(h) {
        if (h.data.console) {
            console.log(h.data.message)
        }
        if (h.data.id) {
            var i = d[h.data.id];
            if (i) {
                i(h.data.message)
            }
            delete d[h.data.id]
        }
        if (h.data.emit) {
            var i = d[h.data.evt];
            if (i) {
                i(h.data.msg)
            }
        }
    }
    this.on = function(h, i) {
        d[h] = i
    };
    this.off = function(h) {
        delete d[h]
    };
    this.initFunction = function(k, j) {
        k = k.toString();
        if (!j) {
            k = k.replace("(", "!!!");
            var i = k.split("!!!");
            var h = i[0].split(" ")[1];
            k = "self." + h + " = function(" + i[1];
            a.postMessage({
                code: k,
                fn: h
            })
        } else {
            a.postMessage({
                code: k
            })
        }
    };
    this.initCode = function(j, l) {
        if (typeof l === "function") {
            l = [l]
        }
        var h = "self." + j + " = function(object, id) {";
        for (var k = 0; k < l.length; k++) {
            h += l[k].toString()
        }
        h += l[0].toString().match(/function ([^\(]+)/)[1] + "(object, id);";
        h += "}";
        a.postMessage({
            code: h,
            fn: j
        })
    };
    this.importScript = function(h) {
        a.postMessage({
            path: h,
            importScript: true
        })
    };
    this.send = function(h, j, l) {
        if (typeof h === "string") {
            var i = h;
            j = j || {};
            j.fn = h
        } else {
            l = j;
            j = h
        }
        var k = Utils.timestamp();
        if (l) {
            d[k] = l
        }
        a.postMessage({
            message: j,
            id: k
        })
    };
    this.destroy = function() {
        if (a.terminate) {
            a.terminate()
        }
        return this._destroy()
    }
});
Class(function XHR() {
    var c = this;
    var b;

    function a(e, f) {
        if (typeof f === "object") {
            for (var d in f) {
                var g = e + "[" + d + "]";
                if (typeof f[d] === "object") {
                    a(g, f[d])
                } else {
                    b.push(g + "=" + f[d])
                }
            }
        } else {
            b.push(e + "=" + f)
        }
    }
    this.get = function(e, h, j, g) {
        if (typeof h === "function") {
            g = j;
            j = h;
            h = null
        } else {
            if (typeof h === "object") {
                var d = "?";
                for (var f in h) {
                    d += f + "=" + h[f] + "&"
                }
                d = d.slice(0, -1);
                e += d
            }
        }
        var i = new XMLHttpRequest();
        i.open("GET", e, true);
        i.send();
        i.onreadystatechange = function() {
            if (i.readyState == 4 && i.status == 200) {
                if (typeof j === "function") {
                    var k = i.responseText;
                    if (g == "text") {
                        j(k)
                    } else {
                        try {
                            Render.nextFrame(function() {
                                j(JSON.parse(k))
                            })
                        } catch (l) {
                            console.error("XHR Parse: " + e + " : " + l.message)
                        }
                    }
                }
                i = null
            }
        }
    };
    this.post = function(d, g, j, f, i) {
        if (typeof g === "function") {
            i = f;
            f = j;
            j = g;
            g = null
        } else {
            if (typeof g === "object") {
                if (j == "json" || f == "json" || i == "json") {
                    g = JSON.stringify(g)
                } else {
                    b = new Array();
                    for (var e in g) {
                        a(e, g[e])
                    }
                    g = b.join("&");
                    g = g.replace(/\[/g, "%5B");
                    g = g.replace(/\]/g, "%5D");
                    b = null
                }
            }
        }
        var h = new XMLHttpRequest();
        h.open("POST", d, true);
        switch (i) {
            case "upload":
                i = "application/upload";
                break;
            default:
                i = "application/x-www-form-urlencoded";
                break
        }
        h.setRequestHeader("Content-type", i);
        h.onreadystatechange = function() {
            if (h.readyState == 4 && h.status == 200) {
                if (typeof j === "function") {
                    var k = h.responseText;
                    if (f == "text") {
                        j(k)
                    } else {
                        try {
                            Render.nextFrame(function() {
                                j(JSON.parse(k))
                            })
                        } catch (l) {
                            console.error("XHR Parse: " + d + " : " + l.message)
                        }
                    }
                }
                h = null
            }
        };
        h.send(g)
    }
}, "Static");
Class(function Color(b) {
    Inherit(this, Component);
    var f = this;
    this.r = 1;
    this.g = 1;
    this.b = 1;
    (function() {
        e(b)
    })();

    function e(g) {
        if (g instanceof Color) {
            d(g)
        } else {
            if (typeof g === "number") {
                c(g)
            }
        }
    }

    function d(g) {
        f.r = g.r;
        f.g = g.g;
        f.b = g.b
    }

    function c(g) {
        g = Math.floor(g);
        f.r = (g >> 16 & 255) / 255;
        f.g = (g >> 8 & 255) / 255;
        f.b = (g & 255) / 255
    }

    function a(i, h, g) {
        if (g < 0) {
            g += 1
        }
        if (g > 1) {
            g -= 1
        }
        if (g < 1 / 6) {
            return i + (h - i) * 6 * g
        }
        if (g < 1 / 2) {
            return h
        }
        if (g < 2 / 3) {
            return i + (h - i) * 6 * (2 / 3 - g)
        }
        return i
    }
    this.set = function(g) {
        e(g);
        return this
    };
    this.setRGB = function(j, i, h) {
        this.r = j;
        this.g = i;
        this.b = h;
        return this
    };
    this.setHSL = function(j, i, g) {
        if (i === 0) {
            this.r = this.g = this.b = g
        } else {
            var m = g <= 0.5 ? g * (1 + i) : g + i - (g * i);
            var k = (2 * g) - m;
            this.r = a(k, m, j + 1 / 3);
            this.g = a(k, m, j);
            this.b = a(k, m, j - 1 / 3)
        }
        return this
    };
    this.getStyle = function() {
        return "rgb(" + ((this.r * 255) | 0) + "," + ((this.g * 255) | 0) + "," + ((this.b * 255) | 0) + ")"
    };
    this.getHex = function() {
        return (this.r * 255) << 16 ^ (this.g * 255) << 8 ^ (this.b * 255) << 0
    };
    this.getHexString = function() {
        return ("000000" + this.getHex().toString(16)).slice(-6)
    };
    this.add = function(g) {
        this.r += g.r;
        this.g += g.g;
        this.b += g.b
    };
    this.mix = function(g, h) {
        this.r = this.r * (1 - h) + (g.r * h);
        this.g = this.g * (1 - h) + (g.g * h);
        this.b = this.b * (1 - h) + (g.b * h)
    };
    this.addScalar = function(g) {
        this.r += g;
        this.g += g;
        this.b += g
    };
    this.multiply = function(g) {
        this.r *= g.r;
        this.g *= g.g;
        this.b *= g.b
    };
    this.multiplyScalar = function(g) {
        this.r *= g;
        this.g *= g;
        this.b *= g
    };
    this.clone = function() {
        return new Color().setRGB(this.r, this.g, this.b)
    }
});
Class(function Matrix2() {
    var o = this;
    var k = Matrix2.prototype;
    var g, f, e, n, m, l, u, t, s;
    var r, q, p, d, c, a, j, i, h;
    this.type = "matrix2";
    this.data = new Float32Array(9);
    (function() {
        v()
    })();

    function v(w) {
        w = w || o.data;
        w[0] = 1, w[1] = 0, w[2] = 0;
        w[3] = 0, w[4] = 1, w[5] = 0;
        w[6] = 0, w[7] = 0, w[8] = 1
    }

    function b(w) {
        w = Math.abs(w) < 0.000001 ? 0 : w;
        return w
    }
    k.identity = function(w) {
        v(w);
        return this
    };
    k.transformVector = function(z) {
        var A = this.data;
        var w = z.x;
        var B = z.y;
        z.x = A[0] * w + A[1] * B + A[2];
        z.y = A[3] * w + A[4] * B + A[5];
        return z
    };
    k.setTranslation = function(y, x, w) {
        var z = w || this.data;
        z[0] = 1, z[1] = 0, z[2] = y;
        z[3] = 0, z[4] = 1, z[5] = x;
        z[6] = 0, z[7] = 0, z[8] = 1;
        return this
    };
    k.getTranslation = function(w) {
        var x = this.data;
        w = w || new Vector2();
        w.x = x[2];
        w.y = x[5];
        return w
    };
    k.setScale = function(z, y, w) {
        var x = w || this.data;
        x[0] = z, x[1] = 0, x[2] = 0;
        x[3] = 0, x[4] = y, x[5] = 0;
        x[6] = 0, x[7] = 0, x[8] = 1;
        return this
    };
    k.setShear = function(z, y, w) {
        var x = w || this.data;
        x[0] = 1, x[1] = z, x[2] = 0;
        x[3] = y, x[4] = 1, x[5] = 0;
        x[6] = 0, x[7] = 0, x[8] = 1;
        return this
    };
    k.setRotation = function(x, w) {
        var A = w || this.data;
        var z = Math.cos(x);
        var y = Math.sin(x);
        A[0] = z, A[1] = -y, A[2] = 0;
        A[3] = y, A[4] = z, A[5] = 0;
        A[6] = 0, A[7] = 0, A[8] = 1;
        return this
    };
    k.setTRS = function(y, w, x, D, C) {
        var B = this.data;
        var A = Math.cos(x);
        var z = Math.sin(x);
        B[0] = A * D, B[1] = -z * C, B[2] = y;
        B[3] = z * D, B[4] = A * C, B[5] = w;
        B[6] = 0, B[7] = 0, B[8] = 1;
        return this
    };
    k.translate = function(x, w) {
        this.identity(Matrix2.__TEMP__);
        this.setTranslation(x, w, Matrix2.__TEMP__);
        return this.multiply(Matrix2.__TEMP__)
    };
    k.rotate = function(w) {
        this.identity(Matrix2.__TEMP__);
        this.setTranslation(w, Matrix2.__TEMP__);
        return this.multiply(Matrix2.__TEMP__)
    };
    k.scale = function(x, w) {
        this.identity(Matrix2.__TEMP__);
        this.setScale(x, w, Matrix2.__TEMP__);
        return this.multiply(Matrix2.__TEMP__)
    };
    k.shear = function(x, w) {
        this.identity(Matrix2.__TEMP__);
        this.setRotation(x, w, Matrix2.__TEMP__);
        return this.multiply(Matrix2.__TEMP__)
    };
    k.multiply = function(x) {
        var y = this.data;
        var w = x.data || x;
        g = y[0], f = y[1], e = y[2];
        n = y[3], m = y[4], l = y[5];
        u = y[6], t = y[7], s = y[8];
        r = w[0], q = w[1], p = w[2];
        d = w[3], c = w[4], a = w[5];
        j = w[6], i = w[7], h = w[8];
        y[0] = g * r + f * d + e * j;
        y[1] = g * q + f * c + e * i;
        y[2] = g * p + f * a + e * h;
        y[3] = n * r + m * d + l * j;
        y[4] = n * q + m * c + l * i;
        y[5] = n * p + m * a + l * h;
        return this
    };
    k.copyTo = function(x) {
        var y = this.data;
        var w = x.data || x;
        w[0] = y[0], w[1] = y[1], w[2] = y[2];
        w[3] = y[3], w[4] = y[4], w[5] = y[5];
        w[6] = y[6], w[7] = y[7], w[8] = y[8];
        return x
    };
    k.copyFrom = function(x) {
        var y = this.data;
        var w = x.data || x;
        w[0] = y[0], w[1] = y[1], w[2] = y[2];
        w[3] = y[3], w[4] = y[4], w[5] = y[5];
        w[6] = y[6], w[7] = y[7], w[8] = y[8];
        return this
    };
    k.getCSS = function() {
        var w = this.data;
        if (Device.tween.css3d) {
            return "matrix3d(" + b(w[0]) + ", " + b(w[3]) + ", 0, 0, " + b(w[1]) + ", " + b(w[4]) + ", 0, 0, 0, 0, 1, 0, " + b(w[2]) + ", " + b(w[5]) + ", 0, 1)"
        } else {
            return "matrix(" + b(w[0]) + ", " + b(w[3]) + ", " + b(w[1]) + ", " + b(w[4]) + ", " + b(w[2]) + ", " + b(w[5]) + ")"
        }
    }
});
Matrix2.__TEMP__ = new Matrix2().data;
Class(function Matrix4() {
    var d = this;
    var b = Matrix4.prototype;
    this.type = "matrix4";
    this.data = new Float32Array(16);
    (function() {
        a()
    })();

    function a(e) {
        var f = e || d.data;
        f[0] = 1, f[4] = 0, f[8] = 0, f[12] = 0;
        f[1] = 0, f[5] = 1, f[9] = 0, f[13] = 0;
        f[2] = 0, f[6] = 0, f[10] = 1, f[14] = 0;
        f[3] = 0, f[7] = 0, f[11] = 0, f[15] = 1
    }

    function c(e) {
        e = Math.abs(e) < 0.000001 ? 0 : e;
        return e
    }
    b.identity = function() {
        a();
        return this
    };
    b.transformVector = function(g, h) {
        var j = this.data;
        var e = g.x,
            k = g.y,
            i = g.z,
            f = g.w;
        h = h || g;
        h.x = j[0] * e + j[4] * k + j[8] * i + j[12] * f;
        h.y = j[1] * e + j[5] * k + j[9] * i + j[13] * f;
        h.z = j[2] * e + j[6] * k + j[10] * i + j[14] * f;
        return h
    };
    b.multiply = function(L, M) {
        var O = this.data;
        var N = L.data || L;
        var K, J, I, H, G, F, E, D, C, B, q, p, o, n, l, k;
        var A, z, y, x, w, v, u, t, s, r, j, i, h, g, f, e;
        K = O[0], J = O[1], I = O[2], H = O[3];
        G = O[4], F = O[5], E = O[6], D = O[7];
        C = O[8], B = O[9], q = O[10], p = O[11];
        o = O[12], n = O[13], l = O[14], k = O[15];
        A = N[0], z = N[1], y = N[2], x = N[3];
        w = N[4], v = N[5], u = N[6], t = N[7];
        s = N[8], r = N[9], j = N[10], i = N[11];
        h = N[12], g = N[13], f = N[14], e = N[15];
        O[0] = K * A + G * z + C * y + o * x;
        O[1] = J * A + F * z + B * y + n * x;
        O[2] = I * A + E * z + q * y + l * x;
        O[3] = H * A + D * z + p * y + k * x;
        O[4] = K * w + G * v + C * u + o * t;
        O[5] = J * w + F * v + B * u + n * t;
        O[6] = I * w + E * v + q * u + l * t;
        O[7] = H * w + D * v + p * u + k * t;
        O[8] = K * s + G * r + C * j + o * i;
        O[9] = J * s + F * r + B * j + n * i;
        O[10] = I * s + E * r + q * j + l * i;
        O[11] = H * s + D * r + p * j + k * i;
        O[12] = K * h + G * g + C * f + o * e;
        O[13] = J * h + F * g + B * f + n * e;
        O[14] = I * h + E * g + q * f + l * e;
        O[15] = H * h + D * g + p * f + k * e;
        return this
    };
    b.setTRS = function(o, n, l, g, f, e, v, u, t, k) {
        k = k || this;
        var r = k.data;
        a(k);
        var j = Math.sin(g);
        var s = Math.cos(g);
        var i = Math.sin(f);
        var q = Math.cos(f);
        var h = Math.sin(e);
        var p = Math.cos(e);
        r[0] = (q * p + i * j * h) * v;
        r[1] = (-q * h + i * j * p) * v;
        r[2] = i * s * v;
        r[4] = h * s * u;
        r[5] = p * s * u;
        r[6] = -j * u;
        r[8] = (-i * p + q * j * h) * t;
        r[9] = (h * i + q * j * p) * t;
        r[10] = q * s * t;
        r[12] = o;
        r[13] = n;
        r[14] = l;
        return k
    };
    b.setScale = function(i, h, f, e) {
        e = e || this;
        var g = e.data || e;
        a(e);
        g[0] = i, g[5] = h, g[10] = f;
        return e
    };
    b.setTranslation = function(g, f, i, e) {
        e = e || this;
        var h = e.data || e;
        a(e);
        h[12] = g, h[13] = f, h[14] = i;
        return e
    };
    b.setRotation = function(g, f, e, i) {
        i = i || this;
        var l = i.data || i;
        a(i);
        var p = Math.sin(g);
        var k = Math.cos(g);
        var o = Math.sin(f);
        var j = Math.cos(f);
        var n = Math.sin(e);
        var h = Math.cos(e);
        l[0] = j * h + o * p * n;
        l[1] = -j * n + o * p * h;
        l[2] = o * k;
        l[4] = n * k;
        l[5] = h * k;
        l[6] = -p;
        l[8] = -o * h + j * p * n;
        l[9] = n * o + j * p * h;
        l[10] = j * k;
        return i
    };
    b.setLookAt = function(i, e, h, g) {
        g = g || this;
        var k = g.data || g;
        var j = D3.m4v31;
        var q = D3.m4v32;
        var p = D3.m4v33;
        j.subVectors(e, i).normalize();
        q.cross(j, h).normalize();
        p.cross(q, j);
        k[0] = q.x;
        k[1] = p.x;
        k[2] = -j.x;
        k[3] = 0;
        k[4] = q.y;
        k[5] = p.y;
        k[6] = -j.y;
        k[7] = 0;
        k[8] = q.z;
        k[9] = p.z;
        k[10] = -j.z;
        k[11] = 0;
        k[12] = 0;
        k[13] = 0;
        k[14] = 0;
        k[15] = 1;
        var o = -i.x;
        var n = -i.y;
        var l = -i.z;
        k[12] += k[0] * o + k[4] * n + k[8] * l;
        k[13] += k[1] * o + k[5] * n + k[9] * l;
        k[14] += k[2] * o + k[6] * n + k[10] * l;
        k[15] += k[3] * o + k[7] * n + k[11] * l;
        return this
    };
    b.setPerspective = function(g, e, j, h, f) {
        g = Math.PI * g / 180 / 2;
        f = f || this;
        var k = f.data || f;
        var n = Math.sin(g);
        var l = 1 / (h - j);
        var i = Math.cos(g) / n;
        k[0] = i / e;
        k[1] = 0;
        k[2] = 0;
        k[3] = 0;
        k[4] = 0;
        k[5] = i;
        k[6] = 0;
        k[7] = 0;
        k[8] = 0;
        k[9] = 0;
        k[10] = -(h + j) * l;
        k[11] = -1;
        k[12] = 0;
        k[13] = 0;
        k[14] = -2 * j * h * l;
        k[15] = 0;
        return this
    };
    b.perspective = function(g, f, h, e) {
        this.setPerspective(g, f, h, e, Matrix4.__TEMP__);
        return this.multiply(Matrix4.__TEMP__)
    };
    b.lookAt = function(g, f, e) {
        this.setLookAt(g, f, e, Matrix4.__TEMP__);
        return this.multiply(Matrix4.__TEMP__)
    };
    b.translate = function(f, e, g) {
        this.setTranslation(f, e, g, Matrix4.__TEMP__);
        return this.multiply(Matrix4.__TEMP__)
    };
    b.rotate = function(g, f, e) {
        this.setRotation(g, f, e, Matrix4.__TEMP__);
        return this.multiply(Matrix4.__TEMP__)
    };
    b.scale = function(g, f, e) {
        this.setScale(g, f, e, Matrix4.__TEMP__);
        return this.multiply(Matrix4.__TEMP__)
    };
    b.copyTo = function(f) {
        var g = this.data;
        var e = f.data || f;
        for (var h = 0; h < 16; h++) {
            e[h] = g[h]
        }
        return f
    };
    b.copyRotationTo = function(f) {
        var g = this.data;
        var e = f.data || f;
        e[0] = g[0];
        e[1] = g[1];
        e[2] = g[2];
        e[3] = g[4];
        e[4] = g[5];
        e[5] = g[6];
        e[6] = g[8];
        e[7] = g[9];
        e[8] = g[10];
        return f
    };
    b.copyPosition = function(e) {
        var g = this.data;
        var f = e.data || e;
        g[12] = f[12];
        g[13] = f[13];
        g[14] = f[14];
        return this
    };
    b.getCSS = function() {
        var e = this.data;
        return "matrix3d(" + c(e[0]) + "," + c(e[1]) + "," + c(e[2]) + "," + c(e[3]) + "," + c(e[4]) + "," + c(e[5]) + "," + c(e[6]) + "," + c(e[7]) + "," + c(e[8]) + "," + c(e[9]) + "," + c(e[10]) + "," + c(e[11]) + "," + c(e[12]) + "," + c(e[13]) + "," + c(e[14]) + "," + c(e[15]) + ")"
    };
    b.extractPosition = function(e) {
        e = e || new Vector3();
        var f = this.data;
        e.set(f[12], f[13], f[14]);
        return e
    };
    b.determinant = function() {
        var e = this.data;
        return e[0] * (e[5] * e[10] - e[9] * e[6]) + e[4] * (e[9] * e[2] - e[1] * e[10]) + e[8] * (e[1] * e[6] - e[5] * e[2])
    };
    b.inverse = function(h) {
        var o = this.data;
        var q = (h) ? h.data || h : this.data;
        var l = this.determinant();
        if (Math.abs(l) < 0.0001) {
            console.warn("Attempt to inverse a singular Matrix4. ", this.data);
            console.trace();
            return h
        }
        var g = o[0],
            u = o[4],
            r = o[8],
            k = o[12],
            f = o[1],
            t = o[5],
            p = o[9],
            j = o[13],
            e = o[2],
            s = o[6],
            n = o[10],
            i = o[14];
        l = 1 / l;
        q[0] = (t * n - p * s) * l;
        q[1] = (r * s - u * n) * l;
        q[2] = (u * p - r * t) * l;
        q[4] = (p * e - f * n) * l;
        q[5] = (g * n - r * e) * l;
        q[6] = (r * f - g * p) * l;
        q[8] = (f * s - t * e) * l;
        q[9] = (u * e - g * s) * l;
        q[10] = (g * t - u * f) * l;
        q[12] = -(k * q[0] + j * q[4] + i * q[8]);
        q[13] = -(k * q[1] + j * q[5] + i * q[9]);
        q[14] = -(k * q[2] + j * q[6] + i * q[10]);
        return h
    };
    b.transpose = function(h) {
        var j = this.data;
        var l = h ? h.data || h : this.data;
        var g = j[0],
            q = j[4],
            n = j[8],
            f = j[1],
            p = j[5],
            k = j[9],
            e = j[2],
            o = j[6],
            i = j[10];
        l[0] = g;
        l[1] = q;
        l[2] = n;
        l[4] = f;
        l[5] = p;
        l[6] = k;
        l[8] = e;
        l[9] = o;
        l[10] = i
    }
});
Matrix4.__TEMP__ = new Matrix4().data;
Class(function Vector2(c, a) {
    var d = this;
    var b = Vector2.prototype;
    this.x = typeof c == "number" ? c : 0;
    this.y = typeof a == "number" ? a : 0;
    this.type = "vector2";
    b.set = function(e, f) {
        this.x = e;
        this.y = f;
        return this
    };
    b.clear = function() {
        this.x = 0;
        this.y = 0;
        return this
    };
    b.copyTo = function(e) {
        e.x = this.x;
        e.y = this.y;
        return this
    };
    b.copyFrom = function(e) {
        this.x = e.x;
        this.y = e.y;
        return this
    };
    b.addVectors = function(f, e) {
        this.x = f.x + e.x;
        this.y = f.y + e.y;
        return this
    };
    b.subVectors = function(f, e) {
        this.x = f.x - e.x;
        this.y = f.y - e.y;
        return this
    };
    b.multiplyVectors = function(f, e) {
        this.x = f.x * e.x;
        this.y = f.y * e.y;
        return this
    };
    b.add = function(e) {
        this.x += e.x;
        this.y += e.y;
        return this
    };
    b.sub = function(e) {
        this.x -= e.x;
        this.y -= e.y;
        return this
    };
    b.multiply = function(e) {
        this.x *= e;
        this.y *= e;
        return this
    };
    b.divide = function(e) {
        this.x /= e;
        this.y /= e;
        return this
    };
    b.lengthSq = function() {
        return (this.x * this.x + this.y * this.y) || 0.00001
    };
    b.length = function() {
        return Math.sqrt(this.lengthSq())
    };
    b.normalize = function() {
        var e = this.length();
        this.x /= e;
        this.y /= e;
        return this
    };
    b.perpendicular = function(h, f) {
        var g = this.x;
        var e = this.y;
        this.x = -e;
        this.y = g;
        return this
    };
    b.lerp = function(e, f) {
        this.x += (e.x - this.x) * f;
        this.y += (e.y - this.y) * f;
        return this
    };
    b.setAngleRadius = function(e, f) {
        this.x = Math.cos(e) * f;
        this.y = Math.sin(e) * f;
        return this
    };
    b.addAngleRadius = function(e, f) {
        this.x += Math.cos(e) * f;
        this.y += Math.sin(e) * f;
        return this
    };
    b.clone = function() {
        return new Vector2(this.x, this.y)
    };
    b.dot = function(f, e) {
        e = e || this;
        return (f.x * e.x + f.y * e.y)
    };
    b.distanceTo = function(g, h) {
        var f = this.x - g.x;
        var e = this.y - g.y;
        if (!h) {
            return Math.sqrt(f * f + e * e)
        }
        return f * f + e * e
    };
    b.solveAngle = function(f, e) {
        if (!e) {
            e = this
        }
        return Math.acos(f.dot(e) / (f.length() * e.length()))
    };
    b.equals = function(e) {
        return this.x == e.x && this.y == e.y
    }
});
Class(function Vector3(d, b, a, e) {
    var f = this;
    var c = Vector3.prototype;
    this.x = typeof d === "number" ? d : 0;
    this.y = typeof b === "number" ? b : 0;
    this.z = typeof a === "number" ? a : 0;
    this.w = typeof e === "number" ? e : 1;
    this.type = "vector3";
    c.set = function(g, j, i, h) {
        this.x = g || 0;
        this.y = j || 0;
        this.z = i || 0;
        this.w = h || 1;
        return this
    };
    c.clear = function() {
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.w = 1;
        return this
    };
    c.copyTo = function(g) {
        g.x = this.x;
        g.y = this.y;
        g.z = this.z;
        g.w = this.w;
        return g
    };
    c.copyFrom = function(g) {
        this.x = g.x;
        this.y = g.y;
        this.z = g.z;
        this.w = g.w;
        return this
    };
    c.lengthSq = function() {
        return this.x * this.x + this.y * this.y + this.z * this.z
    };
    c.length = function() {
        return Math.sqrt(this.lengthSq())
    };
    c.normalize = function() {
        var g = 1 / this.length();
        this.set(this.x * g, this.y * g, this.z * g);
        return this
    };
    c.addVectors = function(h, g) {
        this.x = h.x + g.x;
        this.y = h.y + g.y;
        this.z = h.z + g.z;
        return this
    };
    c.subVectors = function(h, g) {
        this.x = h.x - g.x;
        this.y = h.y - g.y;
        this.z = h.z - g.z;
        return this
    };
    c.multiplyVectors = function(h, g) {
        this.x = h.x * g.x;
        this.y = h.y * g.y;
        this.z = h.z * g.z;
        return this
    };
    c.add = function(g) {
        this.x += g.x;
        this.y += g.y;
        this.z += g.z;
        return this
    };
    c.sub = function(g) {
        this.x -= g.x;
        this.y -= g.y;
        this.z -= g.z;
        return this
    };
    c.multiply = function(g) {
        this.x *= g;
        this.y *= g;
        this.z *= g;
        return this
    };
    c.divide = function(g) {
        this.x /= g;
        this.y /= g;
        this.z /= g;
        return this
    };
    c.lerp = function(g, h) {
        this.x += (g.x - this.x) * h;
        this.y += (g.y - this.y) * h;
        this.z += (g.z - this.z) * h;
        return this
    };
    c.setAngleRadius = function(g, h) {
        this.x = Math.cos(g) * h;
        this.y = Math.sin(g) * h;
        this.z = Math.sin(g) * h;
        return this
    };
    c.addAngleRadius = function(g, h) {
        this.x += Math.cos(g) * h;
        this.y += Math.sin(g) * h;
        this.z += Math.sin(g) * h;
        return this
    };
    c.dot = function(h, g) {
        g = g || this;
        return h.x * g.x + h.y * g.y + h.z * g.z
    };
    c.clone = function() {
        return new Vector3(this.x, this.y, this.z)
    };
    c.cross = function(i, h) {
        if (!h) {
            h = this
        }
        var g = i.y * h.z - i.z * h.y;
        var k = i.z * h.x - i.x * h.z;
        var j = i.x * h.y - i.y * h.x;
        this.set(g, k, j, this.w);
        return this
    };
    c.distanceTo = function(j, k) {
        var i = this.x - j.x;
        var h = this.y - j.y;
        var g = this.z - j.z;
        if (!k) {
            return Math.sqrt(i * i + h * h + g * g)
        }
        return i * i + h * h + g * g
    };
    c.solveAngle = function(h, g) {
        if (!g) {
            g = this
        }
        return Math.acos(h.dot(g) / (h.length() * g.length()))
    };
    c.equals = function(g) {
        return this.x == g.x && this.y == g.y && this.z == g.z
    }
});
Class(function Mobile() {
    Inherit(this, Events);
    var e = this;
    var a;
    var i = true;
    var h = {};
    this.sleepTime = 10000;
    if (Device.mobile) {
        setInterval(f, 250);
        this.phone = Device.mobile.phone;
        this.tablet = Device.mobile.tablet;
        this.orientation = Math.abs(window.orientation) == 90 ? "landscape" : "portrait";
        this.os = (function() {
            if (Device.detect(["ipad", "iphone"])) {
                return "iOS"
            }
            if (Device.detect(["android", "kindle"])) {
                return "Android"
            }
            if (Device.detect("windows phone")) {
                return "Windows"
            }
            if (Device.detect("blackberry")) {
                return "Blackberry"
            }
            return "Unknown"
        })();
        this.version = (function() {
            try {
                if (e.os == "iOS") {
                    var l = Device.agent.split("os ")[1].split("_");
                    var j = l[0];
                    var m = l[1].split(" ")[0];
                    return Number(j + "." + m)
                }
                if (e.os == "Android") {
                    var k = Device.agent.split("android ")[1].split(";")[0];
                    if (k.length > 3) {
                        k = k.slice(0, -2)
                    }
                    return Number(k)
                }
                if (e.os == "Windows") {
                    return Number(Device.agent.split("windows phone ")[1].split(";")[0])
                }
            } catch (n) {}
            return -1
        })();
        this.browser = (function() {
            if (e.os == "iOS") {
                return Device.detect("crios") ? "Chrome" : "Safari"
            }
            if (e.os == "Android") {
                if (Device.detect("chrome")) {
                    return "Chrome"
                }
                if (Device.detect("firefox")) {
                    return "Firefox"
                }
                return "Browser"
            }
            if (e.os == "Windows") {
                return "IE"
            }
            return "Unknown"
        })();
        Hydra.ready(function() {
            window.addEventListener("orientationchange", d);
            window.addEventListener("touchstart", c);
            window.addEventListener("touchmove", g);
            window.onresize = b
        });

        function b() {
            if (!e.allowScroll) {
                document.body.scrollTop = 0
            }
            setTimeout(function() {
                Stage.width = window.innerWidth;
                Stage.height = window.innerHeight;
                e.events.fire(HydraEvents.RESIZE)
            }, 100)
        }

        function d() {
            e.orientation = Math.abs(window.orientation) == 90 ? "landscape" : "portrait";
            setTimeout(function() {
                Stage.width = window.innerWidth;
                Stage.height = window.innerHeight;
                HydraEvents._fireEvent(HydraEvents.ORIENTATION, {
                    orientation: e.orientation
                })
            }, 100)
        }

        function c(m) {
            var n = Utils.touchEvent(m);
            var l = m.target;
            var k = l.nodeName == "INPUT" || l.nodeName == "TEXTAREA" || l.nodeName == "SELECT";
            if (e.allowScroll) {
                return
            }
            if (i) {
                return m.preventDefault()
            }
            var j = true;
            var l = m.target;
            while (l.parentNode) {
                if (k) {
                    j = false
                }
                if (l._scrollParent) {
                    j = false;
                    h.target = l;
                    h.y = n.y
                }
                l = l.parentNode
            }
            if (j) {
                m.preventDefault()
            }
        }

        function g(l) {
            var m = Utils.touchEvent(l);
            if (e.allowScroll) {
                return
            }
            if (h.target) {
                var k = h.target;
                var j = k.__scrollHeight || Number((k.style.height || "0px").slice(0, -2));
                k.__scrollheight = j;
                if (m.y < h.y) {
                    if (Math.round(k.scrollTop) == Math.round(j / 2)) {
                        l.preventDefault()
                    }
                } else {
                    if (k.scrollTop == 0) {
                        l.preventDefault()
                    }
                }
            }
        }
    }

    function f() {
        var j = Date.now();
        if (a) {
            if (j - a > e.sleepTime) {
                e.events.fire(HydraEvents.BACKGROUND)
            }
        }
        a = j
    }
    this.Class = window.Class;
    this.fullscreen = function() {
        if (e.os == "Android") {
            __window.bind("touchstart", function() {
                Device.openFullscreen()
            })
        }
    };
    this.overflowScroll = function(k, j, m) {
        if (!Device.mobile) {
            return false
        }
        var l = {
            "-webkit-overflow-scrolling": "touch"
        };
        if ((!j && !m) || (j && m)) {
            l.overflow = "scroll"
        }
        if (!j && m) {
            l.overflowY = "scroll";
            l.overflowX = "hidden"
        }
        if (j && !m) {
            l.overflowX = "scroll";
            l.overflowY = "hidden"
        }
        k.css(l);
        k.div._scrollParent = true;
        i = false
    }
}, "Static");
Class(function Spark() {
    Namespace("Spark", this);
    this.determine = function(a) {
        return typeof a.z === "undefined" ? Vector2 : Vector3
    }
}, "Static");
Spark.Class(function Emitter(c, e) {
    Inherit(this, Component);
    var h = this;
    var d;
    var b = 0;
    var a = (function() {
        if (c) {
            return c.type == "vector3" ? Vector3 : Vector2
        } else {
            return Vector2
        }
    })();
    this.initializers = [];
    this.position = c || new a();
    this.autoEmit = 1;
    (function() {
        g();
        if (e != 0) {
            f(e || 100)
        }
    })();

    function g() {
        d = h.initClass(ObjectPool)
    }

    function f(l) {
        b += l;
        var k = [];
        for (var j = 0; j < l; j++) {
            k.push(new Spark.Particle())
        }
        d.insert(k)
    }
    this.addInitializer = function(i) {
        if (typeof i !== "function") {
            throw "Initializer must be a function"
        }
        this.initializers.push(i)
    };
    this.removeInitializer = function(j) {
        var i = this.initializers.indexOf(j);
        if (i > -1) {
            this.initializers.splice(i, 1)
        }
    };
    this.emit = function(l) {
        if (l > b) {
            f(l - b)
        }
        if (!this.parent) {
            throw "Emitter needs to be added to a System"
        }
        l = l || 1;
        for (var m = 0; m < l; m++) {
            var n = d.get();
            n.copyFrom(this.position);
            n.emitter = this;
            for (var k = 0; k < this.initializers.length; k++) {
                this.initializers[k](n)
            }
            this.parent.addParticle(n)
        }
    };
    this.remove = function(i) {
        d.insert(i)
    };
    this.addToPool = function(i) {
        d.insert(i)
    }
});
Spark.Class(function System() {
    Inherit(this, Component);
    var c = this;
    var a = {};
    this.emitters = new LinkedList();
    this.particles = new LinkedList();
    this.behaviors = new LinkedList();
    (function() {})();

    function b(e) {
        var d = c.behaviors.start();
        while (d) {
            d.applyBehavior(e);
            d = c.behaviors.next()
        }
    }
    this.addEmitter = function(d) {
        if (!(d instanceof Spark.Emitter)) {
            throw "Emitter must be Spark.Emitter"
        }
        this.emitters.push(d);
        d.parent = this
    };
    this.removeEmitter = function(d) {
        if (!(d instanceof Spark.Emitter)) {
            throw "Emitter must be Spark.Emitter"
        }
        this.emitters.remove(d);
        d.parent = null
    };
    this.addParticle = function(d) {
        if (!(d instanceof Spark.Particle)) {
            throw "Particle must be Spark.Particle"
        }
        this.particles.push(d);
        if (a.create) {
            a.create(d)
        }
        d.system = this
    };
    this.removeParticle = function(d) {
        if (!(d instanceof Spark.Particle)) {
            throw "Particle must be Spark.Particle"
        }
        if (d.emitter) {
            d.emitter.remove(d)
        }
        this.particles.remove(d);
        if (a.destroy) {
            a.destroy(d)
        }
        d.system = null
    };
    this.addBehavior = function(d) {
        if (!d || typeof d.applyBehavior === "undefined") {
            throw "Behavior must have applyBehavior method"
        }
        this.behaviors.push(d);
        d.system = this
    };
    this.removeBehavior = function(d) {
        if (!d || typeof d.applyBehavior === "undefined") {
            throw "Behavior must have applyBehavior method"
        }
        this.behaviors.remove(d);
        d.system = null
    };
    this.update = function() {
        var d = this.particles.start();
        while (d) {
            b(d);
            d.update();
            if (a.update) {
                a.update(d)
            }
            d = this.particles.next()
        }
    };
    this.bind = function(d, e) {
        a[d] = e
    };
    this.unbind = function(d) {
        delete a[d]
    }
});
Spark.Class(function Particle(g, e, c) {
    var h = this;
    var a = typeof c === "number" ? Vector3 : Vector2;
    var f = Particle.prototype;
    Inherit(this, a);
    var b;
    var d = new a();
    this.set(g, e, c);
    this.saveTo = null;
    this.locked = false;
    this.damping = null;
    this.mass = 1;
    this.velocity = new a();
    this.acceleration = new a();
    this.behaviors = new LinkedList();
    f.update = function() {
        this.updateBehaviors();
        this.velocity.add(this.acceleration);
        if (!this.locked) {
            this.add(this.velocity)
        }
        this.acceleration.clear();
        if (this.dampening) {
            this.velocity.multiply(this.dampening)
        }
        if (this.saveTo) {
            this.copyTo(this.saveTo)
        }
    };
    f.updateBehaviors = function() {
        var i = this.behaviors.start();
        while (i) {
            var j = this.system.particles.start(h);
            while (j) {
                if (j != this) {
                    i.applyBehavior(j)
                }
                j = this.system.particles.next(h)
            }
            i = this.behaviors.next()
        }
    };
    f.applyForce = function(i) {
        d.copyFrom(i).multiply(1 / this.mass);
        this.acceleration.add(d)
    };
    f.addBehavior = function(i) {
        if (!i || typeof i.applyBehavior === "undefined") {
            throw "Behavior must have applyBehavior method"
        }
        if (i.position) {
            i.position = this
        }
        this.behaviors.push(i)
    };
    f.removeBehavior = function(i) {
        if (!i || typeof i.applyBehavior === "undefined") {
            throw "Behavior must have applyBehavior method"
        }
        this.behaviors.remove(i)
    };
    f.destroy = function() {
        if (this.system) {
            this.system.removeParticle(this)
        }
    }
});
Spark.Class(function BasicBehavior() {
    var g = this;
    var e;
    var a;
    this.bounds = {};
    this.friction = 1;
    this.collision = false;
    this.snapOrigin = false;
    (function() {})();

    function c(i) {
        var h = g.bounds;
        if (!h) {
            return
        }
        if (h.width && h.height) {
            if (i.x < h.x) {
                i.x = h.x;
                i.velocity.x *= -g.bounds.friction || -1
            } else {
                if (i.x > h.width) {
                    i.x = h.width;
                    i.velocity.x *= -g.bounds.friction || -1
                }
            } if (i.y < h.y) {
                i.y = h.y;
                i.velocity.y *= -g.bounds.friction || -1
            } else {
                if (i.y > h.height) {
                    i.y = h.height;
                    i.velocity.y *= -g.bounds.friction || -1
                }
            } if (h.depth) {
                if (i.z < h.z) {
                    i.z = h.z;
                    i.velocity.z *= -g.bounds.friction || -1
                } else {
                    if (i.z > h.depth) {
                        i.z = h.depth;
                        i.velocity.z *= -g.bounds.friction || -1
                    }
                }
            }
        }
    }

    function d(h) {
        h.velocity.multiply(g.friction)
    }

    function f(i) {
        if (!g.collision) {
            return
        }
        i.radius = i.radius || 1;
        var h = g.system.particles;
        var k = h.start(g);
        while (k) {
            k.radius = k.radius || 1;
            var j = i.radius + k.radius;
            e.subVectors(k, i);
            if (e.length() < j) {
                i.velocity.multiply(-1);
                k.velocity.multiply(-1);
                i.update();
                k.update()
            }
            k = h.next(g)
        }
    }

    function b(h) {
        if (!g.snapOrigin) {
            return
        }
        if (!h.origin) {
            h.origin = new a();
            h.origin.copyFrom(h)
        }
        e.subVectors(h.origin, h).multiply(g.snapOrigin);
        h.applyForce(e)
    }
    this.applyBehavior = function(h) {
        if (!e) {
            a = Spark.determine(h);
            e = new a()
        }
        c(h);
        d(h);
        f(h);
        b(h)
    }
});
Spark.Class(function Attractor(g, b, a, i) {
    Inherit(this, Component);
    var f = this;
    var d = g.type == "vector2" ? Vector2 : Vector3;
    var c = new d();
    b = b || 100;
    a = a || 1000;
    var h = a * a;
    var e = 0;
    this.position = g || new d();
    this.clamp = 100;
    this.enabled = true;
    (function() {})();
    this.get("force", function() {
        return b
    });
    this.set("force", function(j) {
        b = j
    });
    this.get("radius", function() {
        return a
    });
    this.set("radius", function(j) {
        a = j;
        h = j * j
    });
    this.applyBehavior = function(k) {
        if (!this.enabled) {
            return false
        }
        k = i ? k[i] : k;
        c.copyFrom(this.position);
        c.sub(k);
        e = c.lengthSq();
        if (e > 0.00004 && e < h) {
            var j = e / h;
            c.normalize();
            c.multiply(1 - e / h);
            c.multiply(b);
            k.applyForce(c)
        }
    }
});
Spark.Class(function Force(a) {
    var b = this;
    this.force = a;
    (function() {
        if (!a.type || !a.type.strpos("vector")) {
            throw "Spark.Force must be Vector"
        }
    })();
    this.applyBehavior = function(c) {
        c.applyForce(this.force)
    }
});
Class(function Verlet() {
    Namespace("Verlet", this);
    this.Particle = Spark.Particle
}, "Static");
Verlet.Class(function Physics() {
    Inherit(this, Component);
    var a = this;
    this.behaviors = new LinkedList();
    this.particles = new LinkedList();
    this.joins = new LinkedList();
    this.springs = new LinkedList();
    (function() {})();
    this.addBehavior = function(c) {
        this.behaviors.push(c)
    };
    this.removeBehavior = function(c) {
        this.behaviors.remove(c)
    };
    this.addParticle = function(b) {
        b.system = this;
        this.particles.push(b);
        if (!b.damping) {
            b.damping = 0.98
        }
    };
    this.removeParticle = function(b) {
        b.system = null;
        this.particles.remove(b)
    };
    this.addSpring = function(b) {
        b.system = this;
        this.springs.push(b)
    };
    this.removeSpring = function(b) {
        b.system = null;
        this.springs.remove(b)
    };
    this.addJoin = function(b) {
        if (!this.getJoin(b.a, b.b)) {
            this.joins.push(b)
        }
    };
    this.removeJoin = function(b) {
        this.joins.remove(b)
    };
    this.getJoin = function(d, c) {
        var e = this.joins.start();
        while (e) {
            if ((e.a == d && e.b == c) || (e.a == c && e.b == c)) {
                return e
            }
            e = this.joins.next()
        }
    };
    this.update = function(b) {
        b = b || 16;
        this.updateJoins(b);
        this.updateSprings(b);
        this.updateParticles(b)
    };
    this.updateParticles = function(e) {
        var c, d;
        c = this.behaviors.start();
        while (c) {
            d = this.particles.start();
            while (d) {
                c.applyBehavior(d);
                d = this.particles.next()
            }
            c = this.behaviors.next()
        }
        d = this.particles.start();
        while (d) {
            d.update(e);
            d = this.particles.next()
        }
    };
    this.updateJoins = function(c) {
        var b = this.joins.start();
        while (b) {
            b.update(c);
            b = this.joins.next()
        }
    };
    this.updateSprings = function(c) {
        var b = this.springs.start();
        while (b) {
            b.update(c);
            b = this.springs.next()
        }
    }
});
Verlet.Class(function Join(d, b) {
    var f = this;
    var a, e;
    this.a = d;
    this.b = b;
    this.stiffness = 0.1;
    this.distance = 0;
    this.damping = 0.1;
    this.currentDistance = 0;
    (function() {
        c()
    })();

    function c() {
        var g = d.type == "vector3" ? Vector3 : Vector2;
        a = new g();
        e = new g();
        f.distance = d.distanceTo(b) * 0.95
    }
    this.update = function() {
        a.subVectors(d, b);
        var g = a.length();
        if (g > f.distance) {
            a.divide(g).multiply(g - f.distance);
            e.subVectors(b.velocity, d.velocity);
            a.multiply(this.stiffness);
            e.multiply(this.damping);
            a.subVectors(a, e);
            if (!d.locked && !b.locked) {
                b.applyForce(a);
                d.applyForce(a.multiply(-1))
            } else {
                if (d.locked) {
                    b.applyForce(a.multiply(2))
                } else {
                    d.applyForce(a.multiply(-2))
                }
            }
        }
        this.currentDistance = g
    }
});
Verlet.Class(function Spring(b, c) {
    var g = this;
    var a = b.type == "vector2" ? Vector2 : Vector3;
    var d = new a();
    this.id = Utils.timestamp();
    this.particle = b;
    this.target = c || b;
    this.damping = 0.3;
    this.friction = 0.9;
    this.locked = false;
    this.handles = new LinkedList();
    this.springs = [];
    (function() {
        b.damping = null;
        b.spring = g
    })();

    function e() {
        var i = g.handles.start();
        while (i) {
            d.subVectors(i, b).multiply(g.damping);
            b.applyForce(d);
            i = g.handles.next()
        }
    }

    function f() {
        for (var j = g.springs.length - 1; j > -1; j--) {
            var h = g.springs[j];
            var l = h["distanceTo" + g.id];
            d.subVectors(h.particle, b);
            var k = d.type == "vector2" ? Math.atan2(d.y, d.x) : d.solveAngle(h.particle, b);
            d.x = h.particle.x - Math.cos(k) * l;
            d.y = h.particle.y - Math.sin(k) * l;
            if (d.type == "vector3") {
                d.z = h.particle.z - Math.sin(k) * l
            }
            d.sub(b).multiply(g.damping);
            b.applyForce(d);
            b.velocity.multiply(g.friction)
        }
    }
    this.update = function() {
        d.subVectors(this.target, b).multiply(this.damping);
        b.applyForce(d);
        b.velocity.multiply(this.friction);
        if (this.handles.length) {
            e()
        }
        if (this.springs.length && !this.locked) {
            f()
        }
    };
    this.follow = function(h) {
        this.target = h;
        return this
    };
    this.chain = function(h, i) {
        h["distanceTo" + g.id] = i || b.distanceTo(h.particle);
        this.springs.push(h);
        return this
    };
    this.unchain = function(h) {
        var i = this.springs.indexOf(h);
        if (i > -1) {
            this.springs.splice(i, 1)
        }
        return this
    };
    this.addHandle = function(h) {
        this.handles.push(h)
    };
    this.removeHandle = function(h) {
        this.handles.remove(h)
    };
    this.release = function() {
        this.system.removeSpring(this)
    }
});
Class(function D3() {
    Namespace("D3", this);
    this.CSS3D = Device.tween.css3d;
    this.m4v31 = new Vector3();
    this.m4v32 = new Vector3();
    this.m4v33 = new Vector3();
    this.UP = new Vector3(0, 1, 0);
    this.FWD = new Vector3(0, 0, -1);
    this.CENTER = new Vector3(0, 0, 0);
    this.translate = function(a, c, b) {
        a = typeof a == "string" ? a : (a || 0) + "px";
        c = typeof c == "string" ? c : (c || 0) + "px";
        b = typeof b == "string" ? b : (b || 0) + "px";
        if (Device.browser.ie) {
            a = 0;
            c = 0
        }
        return "translate3d(" + a + "," + c + "," + b + ")"
    }
}, "Static");
D3.Class(function Camera(c, b, a) {
    Inherit(this, D3.Object3D);
    var d = this;
    this.inverseWorldMatrix = new Matrix4();
    (function() {
        Render.nextFrame(function() {
            d.scene.setProjection(c, b, a)
        })
    })();
    this.set("fov", function(e) {
        c = e;
        d.scene.setProjection(c, b, a)
    });
    this.computeInverseMatrix = function() {
        this.worldMatrix.inverse(this.inverseWorldMatrix);
        return this.inverseWorldMatrix
    };
    this.render = function() {}
});
D3.Class(function Material(o) {
    Inherit(this, Component);
    var k = this;
    var f, m;
    var d, n, g, e, b, h, j;
    var c = true;
    this.material = o;
    this.width = o.width;
    this.height = o.height;
    (function() {
        i();
        l()
    })();

    function i() {
        j = new Vector3();
        h = new Vector3();
        if (Device.browser.ie) {
            o.css({
                marginLeft: -o.width / 2,
                marginTop: -o.height / 2
            })
        }
        if (D3.CSS3D) {
            return false
        }
        d = new Matrix2();
        n = new Matrix4();
        g = new Vector3()
    }

    function l() {
        m = o.element || o;
        if (o.element) {
            Render.nextFrame(function() {
                o.material = k;
                o.object = k.object
            })
        }
    }

    function a(q) {
        if (k.object._scene.fog) {
            var s = k.object._scene.fog;
            h.subVectors(q.camera.position, j);
            var t = h.length();
            if (t > s) {
                var p = (s * 2) - s;
                t -= s;
                var r = Utils.convertRange(t, 0, p, 0, 1);
                r = Utils.clamp(r, 0, 1);
                e = 1 - r;
                m.div.style.opacity = e
            } else {
                if (e < 1) {
                    m.div.style.opacity = 1;
                    e = 1
                }
            }
        }
    }
    this.set("visible", function(p) {
        c = p;
        if (p) {
            o.show()
        } else {
            o.hide()
        }
    });
    this.draw = function(p) {
        p.renderer.addChild(o)
    };
    this.remove = function() {
        if (o.destroy) {
            o.destroy()
        } else {
            if (o.remove) {
                o.remove(true)
            }
        }
    };
    this.render = function(q) {
        if (!c) {
            return
        }
        k.object.worldMatrix.extractPosition(j);
        a(q);
        if (D3.CSS3D) {
            var w = D3.translate("-50%", "-50%", q.cssDistance);
            var v = "perspective(" + q.cssDistance + "px)";
            var s = w + " " + k.object.viewMatrix.getCSS();
            if (Device.browser.ie) {
                m.matrix(v + s)
            } else {
                m.matrix(s)
            }
        } else {
            q.projection.copyTo(n);
            n.multiply(k.object.viewMatrix);
            g.set(0, 0, 0);
            n.transformVector(g);
            g.x = g.x / g.z * q.centerX;
            g.y = g.y / g.z * q.centerY;
            var u = 1 / (g.z / q.cssDistance);
            var r = k.object.rotation.z;
            d.setTRS(g.x, g.y, r, u, u);
            h.subVectors(q.camera.position, j);
            var t = h.length();
            o.setZ(~~(999999 - t)).matrix("translate(-50%, -50%) " + d.getCSS());
            if (g.z <= 0 && !o._meshHidden) {
                o._meshHidden = true;
                o.hide()
            } else {
                if (g.z > 0 && o._meshHidden) {
                    o._meshHidden = false;
                    o.show()
                }
            }
        }
    }
});
D3.Class(function Object3D(f) {
    Inherit(this, Component);
    var h = this;
    var g, c, e;
    var a = true;
    var b = new Matrix4();
    var d = new Vector3();
    this.id = Utils.timestamp();
    this.directMatrix = false;
    this.billboard = false;
    this.material = f || null;
    this.position = new Vector3(0, 0, 0);
    this.rotation = new Vector3(0, 0, 0);
    this.scale = new Vector3(1, 1, 1);
    this.matrix = new Matrix4();
    this.worldMatrix = new Matrix4();
    this.viewMatrix = new Matrix4();
    this.children = new LinkedList();
    (function() {
        if (h.material) {
            h.material.object = h
        }
    })();
    this.get("numChildren", function() {
        return h.children.length
    });
    this.get("depth", function() {
        return h.viewMatrix.data[14]
    });
    this.get("globalPosition", function() {
        h.worldMatrix.extractPosition(d);
        return d
    });
    this.get("enabled", function() {
        return a
    });
    this.set("enabled", function(i) {
        a = i;
        if (h.material) {
            h.material.visibility(a)
        }
        var j = h.children.start();
        while (j) {
            j.enabled = i;
            j = h.children.next()
        }
    });
    this.set("scene", function(i) {
        if (!i) {
            return false
        }
        e = h._scene = i;
        if (h.material) {
            h.material.draw(i)
        }
    });
    this.add = function(i) {
        if (!(i instanceof D3.Object3D)) {
            throw "Can only add D3.Object3D"
        }
        i._parent = this;
        this.children.push(i);
        Render.nextFrame(function() {
            i.scene = e
        })
    };
    this.remove = function(i) {
        if (!(i instanceof D3.Object3D)) {
            throw "Can only remove D3.Object3D"
        }
        i._parent = null;
        i.removed();
        this.children.remove(i)
    };
    this.removed = function() {
        if (this.material) {
            this.material.remove()
        }
    };
    this.empty = function() {
        var i = this.children.start();
        while (i) {
            i._parent = null;
            i.removed();
            i = this.children.next()
        }
        this.children.empty()
    };
    this.updateMatrix = function() {
        if (!this.directMatrix) {
            var k = this.position;
            var j = this.rotation;
            var i = this.scale;
            this.matrix.setTRS(k.x, k.y, k.z, j.x, j.y, j.z, i.x, i.y, i.z)
        }
        if (g) {
            this.matrix.setLookAt(g, D3.CENTER, D3.UP)
        }
        if (this._parent && this._parent.worldMatrix) {
            this._parent.worldMatrix.copyTo(this.worldMatrix);
            this.worldMatrix.multiply(this.matrix)
        } else {
            this.matrix.copyTo(this.worldMatrix)
        } if (c) {
            this.worldMatrix.setLookAt(c.globalPosition, D3.CENTER, D3.UP)
        }
        var l = this.children.start();
        while (l) {
            l.updateMatrix();
            l = this.children.next()
        }
    };
    this.updateView = function(i) {
        if (!a) {
            return false
        }
        if (this.billboard) {
            i.copyTo(b);
            b.transpose();
            b.copyPosition(this.worldMatrix);
            b.scale(this.scale.x, this.scale.y, this.scale.z);
            b.data[3] = 0;
            b.data[7] = 0;
            b.data[11] = 0;
            b.data[15] = 1;
            b.copyTo(this.worldMatrix)
        }
        i.copyTo(this.viewMatrix);
        this.viewMatrix.multiply(this.worldMatrix);
        var j = this.children.start();
        while (j) {
            j.updateView(i);
            j = this.children.next()
        }
    };
    this.render = function(i) {
        if (!a) {
            return false
        }
        if (this.material) {
            this.material.render(i)
        }
        var j = this.children.start();
        while (j) {
            j.render(i);
            j = this.children.next()
        }
    };
    this.lookAt = function(i) {
        if (i instanceof Vector3) {
            g = i
        } else {
            c = i
        }
    };
    this.destroy = function() {
        this.empty();
        if (this._parent) {
            this._parent.remove(this)
        }
        return this._destroy()
    }
});
D3.Class(function PerspectiveProjection() {
    var c = this;
    var b = PerspectiveProjection.prototype;
    this.data = new Float32Array(16);
    (function() {
        a()
    })();

    function a() {
        var d = c.data;
        d[0] = 1, d[1] = 0, d[2] = 0, d[3] = 0;
        d[4] = 0, d[5] = 1, d[6] = 0, d[7] = 0;
        d[8] = 0, d[9] = 0, d[10] = 1, d[11] = 0;
        d[12] = 0, d[13] = 0, d[14] = 0, d[15] = 1
    }
    b.identity = function() {
        a();
        return this
    };
    b.perspective = function(g, f, i, e) {
        var d = this.data;
        var h = i * Math.tan(g * Math.PI / 360);
        var j = e - i;
        d[0] = i / (h * f);
        d[4] = 0;
        d[8] = 0;
        d[12] = 0;
        d[1] = 0;
        d[5] = i / h;
        d[9] = 0;
        d[13] = 0;
        d[2] = 0;
        d[6] = 0;
        d[10] = -(e + i) / j;
        d[14] = -(2 * e * i) / j;
        d[3] = 0;
        d[7] = 0;
        d[11] = -1;
        d[15] = 0
    };
    b.transformVector = function(g, h) {
        var e = g.x,
            j = g.y,
            i = g.z,
            f = g.w;
        var d = this.data;
        h = h || g;
        h.x = d[0] * e + d[4] * j + d[8] * i + d[12] * f;
        h.y = d[1] * e + d[5] * j + d[9] * i + d[13] * f;
        h.z = d[2] * e + d[6] * j + d[10] * i + d[14] * f;
        return h
    };
    b.inverse = function(x) {
        var A = this.data;
        x = x || this.data;
        var I = A[0],
            G = A[1],
            F = A[2],
            D = A[3],
            h = A[4],
            g = A[5],
            f = A[6],
            e = A[7],
            w = A[8],
            v = A[9],
            u = A[10],
            t = A[11],
            K = A[12],
            J = A[13],
            H = A[14],
            E = A[15],
            s = I * g - G * h,
            r = I * f - F * h,
            q = I * e - D * h,
            p = G * f - F * g,
            o = G * e - D * g,
            n = F * e - D * f,
            l = w * J - v * K,
            k = w * H - u * K,
            j = w * E - t * K,
            i = v * H - u * J,
            C = v * E - t * J,
            z = u * E - t * H,
            B = (s * z - r * C + q * i + p * j - o * k + n * l),
            y;
        if (!B) {
            return null
        }
        x[0] = (g * z - f * C + e * i) * y;
        x[1] = (-G * z + F * C - D * i) * y;
        x[2] = (J * n - H * o + E * p) * y;
        x[3] = (-v * n + u * o - t * p) * y;
        x[4] = (-h * z + f * j - e * k) * y;
        x[5] = (I * z - F * j + D * k) * y;
        x[6] = (-K * n + H * q - E * r) * y;
        x[7] = (w * n - u * q + t * r) * y;
        x[8] = (h * C - g * j + e * l) * y;
        x[9] = (-I * C + G * j - D * l) * y;
        x[10] = (K * o - J * q + E * s) * y;
        x[11] = (-w * o + v * q - t * s) * y;
        x[12] = (-h * i + g * k - f * l) * y;
        x[13] = (I * i - G * k + F * l) * y;
        x[14] = (-K * p + J * r - H * s) * y;
        x[15] = (w * p - v * r + u * s) * y;
        return x
    };
    b.copyTo = function(e) {
        var f = this.data;
        var d = e.data || e;
        for (var g = 0; g < 16; g++) {
            d[g] = f[g]
        }
        return e
    }
});
D3.Class(function Scene(k, e) {
    Inherit(this, Component);
    var g = this;
    var l;
    var m, b;
    var i, c, j, h;
    this.children = new LinkedList();
    this.center = new Vector3(0, 0, 0);
    (function() {
        d();
        a();
        f()
    })();

    function d() {
        if (!k || !e) {
            throw "D3.Scene requires width, height"
        }
        m = $("#Scene3D");
        b = m.create("Renderer");
        b.center();
        g.container = m;
        g.renderer = b
    }

    function a() {
        l = {};
        l.projection = new D3.PerspectiveProjection();
        l.scene = g;
        g.uniforms = l
    }

    function f() {
        l.width = k;
        l.height = e;
        l.aspect = k / e;
        l.centerX = k / 2;
        l.centerY = e / 2;
        m.size(k, e)
    }
    this.get("numChildren", function() {
        return g.children.length
    });
    this.get("distance", function() {
        return l.cssDistance
    });
    this.setProjection = function(o, p, n) {
        i = o || (i || 30);
        c = p || 0.1;
        j = n || 1000;
        l.cssDistance = 0.5 / Math.tan(i * Math.PI / 360) * l.height;
        l.projection.perspective(i, l.width / l.height, c, j);
        if (m) {
            m.div.style[CSS.prefix("Perspective")] = l.cssDistance + "px";
            b.div.style[CSS.prefix("TransformStyle")] = "preserve-3d"
        }
    };
    this.resize = function(n, o) {
        k = n;
        e = o;
        f();
        g.setProjection()
    };
    this.add = function(n) {
        if (!(n instanceof D3.Object3D) && !(n instanceof D3.Camera)) {
            throw "Can only add D3.Object3D"
        }
        n._parent = this;
        n.scene = this;
        this.children.push(n)
    };
    this.remove = function(n) {
        if (!(n instanceof D3.Object3D) && !(n instanceof D3.Camera)) {
            throw "Can only remove D3.Object3D"
        }
        n.removed();
        n._parent = null;
        this.children.remove(n)
    };
    this.empty = function() {
        var n = this.children.start();
        while (n) {
            n.removed();
            n = this.children.next()
        }
        this.children.empty()
    };
    this.render = function(n) {
        n.updateMatrix();
        l.camera = n;
        l.viewMatrix = n.computeInverseMatrix();
        var o = this.children.start();
        while (o) {
            o.updateMatrix();
            o.updateView(l.viewMatrix);
            o.render(l);
            o = this.children.next()
        }
    }
});
Class(function SplitTextfield(e, b) {
    Inherit(this, Component);
    var c = new Array();
    (function() {
        switch (b) {
            case "word":
                a();
                break;
            default:
                d();
                break
        }
    })();

    function d() {
        var j = e.div.innerHTML;
        var g = j.split("");
        e.div.innerHTML = "";
        for (var f = 0; f < g.length; f++) {
            if (g[f] == " ") {
                g[f] = "&nbsp;"
            }
            var h = $(null, "span");
            h.html(g[f]).css({
                display: "block",
                position: "relative",
                padding: 0,
                margin: 0,
                cssFloat: "left",
                styleFloat: "left"
            });
            c.push(h);
            e.addChild(h)
        }
        return c
    }

    function a() {
        var k = e.div.innerHTML;
        var g = k.split(" ");
        e.empty();
        for (var f = 0; f < g.length; f++) {
            var j = $(null, "span");
            var h = $(null, "span");
            j.html(g[f]).css({
                display: "block",
                position: "relative",
                padding: 0,
                margin: 0,
                cssFloat: "left",
                styleFloat: "left"
            });
            h.html("&nbsp").css({
                display: "block",
                position: "relative",
                padding: 0,
                margin: 0,
                cssFloat: "left",
                styleFloat: "left"
            });
            c.push(j);
            c.push(h);
            e.addChild(j);
            e.addChild(h)
        }
        return c
    }
    this.getArray = function() {
        return c
    }
});
Class(function CSSAnimation(a) {
    Inherit(this, Component);
    var i = this;
    var n = "a" + Utils.timestamp();
    var d, g, j;
    var k = 0;
    var h = 1000;
    var b = "linear";
    var e = false;
    var l = 1;
    var o = null;
    (function() {})();

    function c() {
        i.playing = false;
        if (i.events) {
            i.events.fire(HydraEvents.COMPLETE, null, true)
        }
    }

    function f() {
        var u = CSS._read();
        var p = "/*" + n + "*/";
        var D = "@-" + Device.vendor + "-keyframes " + n + " {\n";
        var v = p + D;
        if (u.strpos(n)) {
            var x = u.split(p);
            u = u.replace(p + x[1] + p, "")
        }
        var z = d.length - 1;
        var A = Math.round(100 / z);
        var y = 0;
        for (var t = 0; t < d.length; t++) {
            var r = d[t];
            if (t == d.length - 1) {
                y = 100
            }
            v += (r.percent || y) + "% {\n";
            var q = false;
            var w = {};
            var C = {};
            for (var B in r) {
                if (TweenManager.checkTransform(B)) {
                    w[B] = r[B];
                    q = true
                } else {
                    C[B] = r[B]
                }
            }
            if (q) {
                v += "-" + Device.vendor + "-transform: " + TweenManager.parseTransform(w) + ";"
            }
            for (B in C) {
                var s = C[B];
                if (typeof s !== "string" && B != "opacity" && B != "zIndex") {
                    s += "px"
                }
                v += CSS._toCSS(B) + ": " + s + ";"
            }
            v += "\n}\n";
            y += A
        }
        v += "}" + p;
        u += v;
        CSS._write(u)
    }

    function m() {
        var q = CSS._read();
        var r = "/*" + n + "*/";
        if (q.strpos(n)) {
            var p = q.split(r);
            q = q.replace(r + p[1] + r, "")
        }
        CSS._write(q)
    }
    this.set("frames", function(p) {
        d = p;
        f()
    });
    this.set("steps", function(p) {
        o = p;
        if (i.playing && a) {
            a.div.style[CSS.prefix("AnimationTimingFunction")] = "steps(" + p + ")"
        }
    });
    this.set("duration", function(p) {
        h = Math.round(p);
        if (i.playing && a) {
            a.div.style[CSS.prefix("AnimationDuration")] = i.duration + "ms"
        }
    });
    this.get("duration", function() {
        return h
    });
    this.set("delay", function(p) {
        k = Math.round(p);
        if (i.playing && a) {
            a.div.style[CSS.prefix("AnimationDelay")] = i.delay + "ms"
        }
    });
    this.get("delay", function() {
        return k
    });
    this.set("ease", function(p) {
        b = p;
        if (i.playing && a) {
            a.div.style[CSS.prefix("AnimationTimingFunction")] = TweenManager.getEase(b)
        }
    });
    this.get("ease", function() {
        return b
    });
    this.set("loop", function(p) {
        e = p;
        if (i.playing && a) {
            a.div.style[CSS.prefix("AnimationIterationCount")] = e ? "infinite" : l
        }
    });
    this.get("loop", function() {
        return e
    });
    this.set("count", function(p) {
        l = p;
        if (i.playing && a) {
            a.div.style[CSS.prefix("AnimationIterationCount")] = e ? "infinite" : l
        }
    });
    this.get("count", function() {
        return l
    });
    this.play = function() {
        a.div.style[CSS.prefix("AnimationName")] = n;
        a.div.style[CSS.prefix("AnimationDuration")] = i.duration + "ms";
        a.div.style[CSS.prefix("AnimationDelay")] = i.delay + "ms";
        a.div.style[CSS.prefix("AnimationTimingFunction")] = o ? "steps(" + o + ")" : TweenManager.getEase(b);
        a.div.style[CSS.prefix("AnimationIterationCount")] = e ? "infinite" : l;
        a.div.style[CSS.prefix("AnimationPlayState")] = "running";
        i.playing = true;
        clearTimeout(g);
        if (!i.loop) {
            j = Date.now();
            g = setTimeout(c, l * h)
        }
    };
    this.pause = function() {
        i.playing = false;
        clearTimeout(g);
        a.div.style[CSS.prefix("AnimationPlayState")] = "paused"
    };
    this.stop = function() {
        i.playing;
        clearTimeout(g);
        a.div.style[CSS.prefix("AnimationName")] = ""
    };
    this.destroy = function() {
        this.stop();
        a = d = null;
        m();
        return this._destroy()
    }
});
Class(function Warp(i) {
    Inherit(this, Component);
    var d = this;
    var j;
    this.points = [{
        x: 0,
        y: 0
    }, {
        x: 0,
        y: 0
    }, {
        x: 0,
        y: 0
    }, {
        x: 0,
        y: 0
    }];
    this.tl = this.points[0];
    this.tr = this.points[1];
    this.bl = this.points[2];
    this.br = this.points[3];

    function e() {
        if (d.points[1].x == 0) {
            d.points[1].x = d.width
        }
        if (d.points[2].y == 0) {
            d.points[2].y = d.height
        }
        if (d.points[3].x == 0) {
            d.points[3].x = d.width
        }
        if (d.points[3].y == 0) {
            d.points[3].y = d.height
        }
    }

    function h(v, k, A, p, B, q, n, x, o, y, u, l, w, m, C, r) {
        var t = b(v, k, B, q, o, y, w, m);
        var z = b(A, p, n, x, u, l, C, r);
        return f(z, g(t))
    }

    function b(n, s, l, r, k, q, u, p) {
        var o = [n, l, k, s, r, q, 1, 1, 1];
        var t = c(g(o), [u, p, 1]);
        return f(o, [t[0], 0, 0, 0, t[1], 0, 0, 0, t[2]])
    }

    function g(k) {
        return [k[4] * k[8] - k[5] * k[7], k[2] * k[7] - k[1] * k[8], k[1] * k[5] - k[2] * k[4], k[5] * k[6] - k[3] * k[8], k[0] * k[8] - k[2] * k[6], k[2] * k[3] - k[0] * k[5], k[3] * k[7] - k[4] * k[6], k[1] * k[6] - k[0] * k[7], k[0] * k[4] - k[1] * k[3]]
    }

    function f(m, l) {
        var r = Array(9);
        for (var q = 0; q != 3; ++q) {
            for (var o = 0; o != 3; ++o) {
                var p = 0;
                for (var n = 0; n != 3; ++n) {
                    p += m[3 * q + n] * l[3 * n + o]
                }
                r[3 * q + o] = p
            }
        }
        return r
    }

    function c(k, l) {
        return [k[0] * l[0] + k[1] * l[1] + k[2] * l[2], k[3] * l[0] + k[4] * l[1] + k[5] * l[2], k[6] * l[0] + k[7] * l[1] + k[8] * l[2]]
    }

    function a(v, u, o) {
        var m = v[0].x;
        var s = v[0].y;
        var l = v[1].x;
        var r = v[1].y;
        var k = v[2].x;
        var q = v[2].y;
        var y = v[3].x;
        var p = v[3].y;
        var x = h(0, 0, m, s, u, 0, l, r, 0, o, k, q, u, o, y, p);
        for (var n = 0; n < 9; n++) {
            x[n] = x[n] / x[8]
        }
        x = [x[0], x[3], 0, x[6], x[1], x[4], 0, x[7], 0, 0, 1, 0, x[2], x[5], 0, x[8]];
        x = "matrix3d(" + x.join(", ") + ")";
        return x
    }(function() {})();
    this.render = function(k) {
        if (k - j < 5 || !d.points) {
            return false
        }
        j = k;
        if (!d.width) {
            d.width = i.width;
            d.height = i.height;
            i.transformPoint(0, 0);
            if (!d.width) {
                throw "Warp requires width and height"
            }
            e()
        }
        i.div.style[CSS.prefix("Transform")] = a(d.points, d.width, d.height)
    };
    this.tween = function(k, n, q, r, m, l) {
        if (!this.points) {
            return
        }
        if (typeof m !== "number") {
            l = m;
            m = 0
        }
        var o;
        switch (k) {
            case "tl":
                o = this.points[0];
                break;
            case "tr":
                o = this.points[1];
                break;
            case "bl":
                o = this.points[2];
                break;
            case "br":
                o = this.points[3];
                break;
            default:
                throw k + "not found on WarpView. Only tl, tr, bl, br accepted.";
                break
        }
        return TweenManager.tween(o, n, q, r, m, l, this.render)
    }
});
Class(function Canvas(c, e, j) {
    Inherit(this, Component);
    var g = this;
    var n, d, h;
    this.children = [];
    this.offset = {
        x: 0,
        y: 0
    };
    this.retina = j;
    (function() {
        if (j instanceof HydraObject) {
            k(j)
        } else {
            f()
        }
        g.width = c;
        g.height = e;
        g.context._matrix = new Matrix2();
        a(c, e, j)
    })();

    function k() {
        var o = "c" + Utils.timestamp();
        g.context = document.getCSSCanvasContext("2d", o, c, e);
        g.background = "-" + Device.styles.vendor.toLowerCase() + "-canvas(" + o + ")";
        j.css({
            backgroundImage: g.background
        });
        j = null
    }

    function f() {
        g.div = document.createElement("canvas");
        g.context = g.div.getContext("2d");
        g.object = $(g.div)
    }

    function a(o, r, p) {
        var q = (p ? (window.devicePixelRatio || 1) : 1);
        if (g.div) {
            g.div.width = o * q;
            g.div.height = r * q
        }
        g.width = o;
        g.height = r;
        g.scale = q;
        if (g.object) {
            g.object.size(g.width, g.height)
        }
        if (Device.system.retina && p) {
            g.context.scale(q, q);
            g.div.style.width = o + "px";
            g.div.style.height = r + "px"
        }
    }

    function m(q) {
        q = Utils.touchEvent(q);
        q.x += g.offset.x;
        q.y += g.offset.y;
        q.width = 1;
        q.height = 1;
        for (var o = g.children.length - 1; o > -1; o--) {
            var p = g.children[o].hit(q);
            if (p) {
                return p
            }
        }
        return false
    }

    function b(p) {
        var o = m(p);
        if (!o) {
            return g.interacting = false
        }
        g.interacting = true;
        h = o;
        if (Device.mobile) {
            o.events.fire(HydraEvents.HOVER, {
                action: "over"
            }, true);
            o.__time = Date.now()
        }
    }

    function i(p) {
        var o = m(p);
        if (o) {
            g.interacting = true
        } else {
            g.interacting = false
        } if (!Device.mobile) {
            if (o && d) {
                if (o != d) {
                    d.events.fire(HydraEvents.HOVER, {
                        action: "out"
                    }, true);
                    o.events.fire(HydraEvents.HOVER, {
                        action: "over"
                    }, true);
                    d = o
                }
            } else {
                if (o && !d) {
                    d = o;
                    o.events.fire(HydraEvents.HOVER, {
                        action: "over"
                    }, true)
                } else {
                    if (!o && d) {
                        if (d) {
                            d.events.fire(HydraEvents.HOVER, {
                                action: "out"
                            }, true)
                        }
                        d = null
                    }
                }
            }
        }
    }

    function l(p) {
        var o = m(p);
        if (o) {
            g.interacting = true
        } else {
            g.interacting = false
        } if (!h && !o) {
            return
        }
        if (!Device.mobile) {
            if (o && o == h) {
                o.events.fire(HydraEvents.CLICK, {
                    action: "click"
                }, true)
            }
        } else {
            if (h) {
                h.events.fire(HydraEvents.HOVER, {
                    action: "out"
                }, true)
            }
            if (o == h) {
                if (Date.now() - h.__time < 750) {
                    o.events.fire(HydraEvents.CLICK, {
                        action: "click"
                    }, true)
                }
            }
        }
        h = null
    }
    this.set("interactive", function(o) {
        if (!n && o) {
            Stage.bind("touchstart", b);
            Stage.bind("touchmove", i);
            Stage.bind("touchend", l)
        } else {
            if (n && !o) {
                Stage.unbind("touchstart", b);
                Stage.unbind("touchmove", i);
                Stage.unbind("touchend", l)
            }
        }
        n = o
    });
    this.get("interactive", function() {
        return n
    });
    this.toDataURL = function() {
        return g.div.toDataURL()
    };
    this.sort = function() {
        _objects.sort(function(p, o) {
            return p.z - o.z
        })
    };
    this.render = function(q) {
        if (!(typeof q === "boolean" && q)) {
            g.clear()
        }
        var o = g.children.length;
        for (var p = 0; p < o; p++) {
            g.children[p].render()
        }
    };
    this.clear = function() {
        g.context.clearRect(0, 0, g.div.width, g.div.height)
    };
    this.add = function(o) {
        o._canvas = this;
        o._parent = this;
        this.children.push(o);
        o._z = this.children.length
    };
    this.remove = function(p) {
        p._canvas = null;
        p._parent = null;
        var o = this.children.indexOf(p);
        if (o > -1) {
            this.children.splice(o, 1)
        }
    };
    this.destroy = function() {
        for (var o = 0; o < this.children.length; o++) {
            if (this.children[o].destroy) {
                this.children[o].destroy()
            }
        }
        return this._destroy()
    };
    this.startRender = function() {
        Render.startRender(g.render)
    };
    this.stopRender = function() {
        Render.stopRender(g.render)
    };
    this.texture = function(p) {
        var o = new Image();
        o.src = p;
        return o
    };
    this.size = a
});
Class(function CanvasTexture(a, b, d) {
    Inherit(this, CanvasObject);
    var f = this;
    var e;
    this.width = b || 0;
    this.height = d || 0;
    (function() {
        c()
    })();

    function c() {
        if (typeof a === "string") {
            var g = a;
            a = new Image();
            a.src = g;
            a.onload = function() {
                if (!f.width && !f.height) {
                    f.width = a.width / (f._canvas && f._canvas.retina ? 2 : 1);
                    f.height = a.height / (f._canvas && f._canvas.retina ? 2 : 1)
                }
            }
        }
        f.texture = a
    }
    this.draw = function(h) {
        var g = this._canvas.context;
        if (this.isMask() && !h) {
            return false
        }
        if (a) {
            this.startDraw(this.anchor.tx, this.anchor.ty);
            g.drawImage(a, -this.anchor.tx, -this.anchor.ty, this.width, this.height);
            this.endDraw()
        }
        if (e) {
            g.globalCompositeOperation = "source-in";
            e.render(true);
            g.globalCompositeOperation = "source-over"
        }
    };
    this.mask = function(g) {
        if (!g) {
            return e = null
        }
        if (!this._parent) {
            throw "CanvasTexture :: Must add to parent before masking."
        }
        var k = this._parent.children;
        var j = false;
        for (var h = 0; h < k.length; h++) {
            if (g == k[h]) {
                j = true
            }
        }
        if (j) {
            e = g;
            g.masked = this
        } else {
            throw "CanvasGraphics :: Can only mask a sibling"
        }
    }
});
Class(function CanvasGraphics(h, c) {
    Inherit(this, CanvasObject);
    var e = this;
    var j = {};
    var d = [];
    var a, f;
    this.width = h || 0;
    this.height = c || 0;
    (function() {
        i()
    })();

    function b(l) {
        for (var k in j) {
            var m = j[k];
            if (m instanceof Color) {
                l[k] = m.getHexString()
            } else {
                l[k] = m
            }
        }
    }

    function i() {
        a = new ObjectPool(Array, 25)
    }

    function g() {
        var l = a.get();
        for (var k = 0; k < arguments.length; k++) {
            l[k] = arguments[k]
        }
        d.push(l)
    }
    this.set("strokeStyle", function(k) {
        j.strokeStyle = k
    });
    this.get("strokeStyle", function() {
        return j.strokeStyle
    });
    this.set("fillStyle", function(k) {
        j.fillStyle = k
    });
    this.get("fillStyle", function() {
        return j.fillStyle
    });
    this.set("lineWidth", function(k) {
        j.lineWidth = k
    });
    this.get("lineWidth", function() {
        return j.lineWidth
    });
    this.set("lineWidth", function(k) {
        j.lineWidth = k
    });
    this.get("lineWidth", function() {
        return j.lineWidth
    });
    this.set("lineCap", function(k) {
        j.lineCap = k
    });
    this.get("lineCap", function() {
        return j.lineCap
    });
    this.set("lineDashOffset", function(k) {
        j.lineDashOffset = k
    });
    this.get("lineDashOffset", function() {
        return j.lineDashOffset
    });
    this.set("lineJoin", function(k) {
        j.lineJoin = k
    });
    this.get("lineJoin", function() {
        return j.lineJoin
    });
    this.set("lineJoin", function(k) {
        j.lineJoin = k
    });
    this.get("lineJoin", function() {
        return j.lineJoin
    });
    this.set("lineJoin", function(k) {
        j.lineJoin = k
    });
    this.get("lineJoin", function() {
        return j.lineJoin
    });
    this.set("miterLimit", function(k) {
        j.miterLimit = k
    });
    this.get("miterLimit", function() {
        return j.miterLimit
    });
    this.set("font", function(k) {
        j.font = k
    });
    this.get("font", function(k) {
        return j.font
    });
    this.set("textAlign", function(k) {
        j.textAlign = k
    });
    this.get("textAlign", function(k) {
        return j.textAlign
    });
    this.set("textBaseline", function(k) {
        j.textBaseline = k
    });
    this.get("textBaseline", function(k) {
        return j.textBaseline
    });
    this.draw = function(m) {
        if (this.isMask() && !m) {
            return false
        }
        var l = this._canvas.context;
        this.startDraw();
        b(l);
        for (var k = 0; k < d.length; k++) {
            var o = d[k];
            if (!o) {
                continue
            }
            var n = o.shift();
            l[n].apply(l, o);
            o.unshift(n)
        }
        this.endDraw();
        if (f) {
            l.save();
            l.clip();
            f.render(true);
            l.restore()
        }
    };
    this.clear = function() {
        for (var k = 0; k < d.length; k++) {
            d[k].length = 0;
            a.put(d[k])
        }
        d.length = 0
    };
    this.arc = function(m, p, n, l, o, k) {
        if (m && !p) {
            n = m;
            m = 0;
            p = 0
        }
        m = m || 0;
        p = p || 0;
        n = n || 0;
        n -= 90;
        k = k || false;
        o = o || 0;
        o -= 90;
        l = l ? l : this.radius || this.width / 2;
        g("beginPath");
        g("arc", m, p, l, Utils.toRadians(o), Utils.toRadians(n), k)
    };
    this.quadraticCurveTo = function(m, l, k, n) {
        g("quadraticCurveTo", m, l, k, n)
    };
    this.bezierCurveTo = function(m, l, o, n, k, p) {
        g("bezierCurveTo", m, l, o, n, k, p)
    };
    this.fillRect = function(k, n, l, m) {
        g("fillRect", k, n, l, m)
    };
    this.clearRect = function(k, n, l, m) {
        g("clearRect", k, n, l, m)
    };
    this.strokeRect = function(k, n, l, m) {
        g("strokeRect", k, n, l, m)
    };
    this.moveTo = function(k, l) {
        g("moveTo", k, l)
    };
    this.lineTo = function(k, l) {
        g("lineTo", k, l)
    };
    this.stroke = function() {
        g("stroke")
    };
    this.fill = function() {
        if (!f) {
            g("fill")
        }
    };
    this.beginPath = function() {
        g("beginPath")
    };
    this.closePath = function() {
        g("closePath")
    };
    this.fillText = function(m, k, n, l) {
        g("fillText", m, k, n, l)
    };
    this.strokeText = function(m, k, n, l) {
        g("strokeText", m, k, n, l)
    };
    this.setLineDash = function(k) {
        g("setLineDash", k)
    };
    this.mask = function(k) {
        if (!k) {
            return f = null
        }
        if (!this._parent) {
            throw "CanvasTexture :: Must add to parent before masking."
        }
        var n = this._parent.children;
        var m = false;
        for (var l = 0; l < n.length; l++) {
            if (k == n[l]) {
                m = true
            }
        }
        if (m) {
            f = k;
            k.masked = this;
            for (l = 0; l < d.length; l++) {
                if (d[l][0] == "fill" || d[l][0] == "stroke") {
                    d[l].length = 0;
                    a.put(d[l]);
                    d.splice(l, 1)
                }
            }
        } else {
            throw "CanvasGraphics :: Can only mask a sibling"
        }
    }
});
Class(function CanvasObject() {
    Inherit(this, Component);
    var a = this;
    this.alpha = 1;
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    this.rotation = 0;
    this.scale = 1;
    this.visible = true;
    this.anchor = {
        x: 0.5,
        y: 0.5
    };
    this.values = new CanvasValues();
    this.styles = new CanvasValues(true);
    this.children = [];
    this.blendMode = "normal";
    this.updateValues = function() {
        this.anchor.tx = this.anchor.x <= 1 && !this.anchor.full ? this.anchor.x * this.width : this.anchor.x;
        this.anchor.ty = this.anchor.y <= 1 && !this.anchor.full ? this.anchor.y * this.height : this.anchor.y;
        this.values.setTRSA(this.x, this.y, Utils.toRadians(this.rotation), this.scaleX || this.scale, this.scaleY || this.scale, this.alpha);
        if (this._parent.values) {
            this.values.calculate(this._parent.values)
        }
        if (this._parent.styles) {
            this.styles.calculateStyle(this._parent.styles)
        }
    };
    this.render = function(d) {
        if (!this.visible) {
            return false
        }
        this.updateValues();
        if (this.draw) {
            this.draw(d)
        }
        var b = this.children.length;
        for (var c = 0; c < b; c++) {
            this.children[c].render(d)
        }
    };
    this.startDraw = function(d, c) {
        var b = this._canvas.context;
        var j = this.values.data;
        var h = j[0] + (d || 0);
        var g = j[1] + (c || 0);
        b.save();
        b._matrix.setTRS(h, g, j[2], j[3], j[4]);
        b.globalCompositeOperation = this.blendMode || "normal";
        var f = b._matrix.data;
        b.transform(f[0], f[3], f[1], f[4], f[2], f[5]);
        b.globalAlpha = j[5];
        if (this.styles.styled) {
            var k = this.styles.values;
            for (var i in k) {
                var e = k[i];
                if (e instanceof Color) {
                    b[i] = e.getHexString()
                } else {
                    b[i] = e
                }
            }
        }
    };
    this.endDraw = function() {
        this._canvas.context.restore()
    };
    this.add = function(b) {
        b._canvas = this._canvas;
        b._parent = this;
        this.children.push(b);
        b._z = this.children.length
    };
    this.remove = function(c) {
        c._canvas = null;
        c._parent = null;
        var b = this.children.indexOf(c);
        if (b > -1) {
            this.children.splice(b, 1)
        }
    };
    this.isMask = function() {
        var b = this;
        while (b) {
            if (b.masked) {
                return true
            }
            b = b._parent
        }
        return false
    };
    this.unmask = function() {
        this.masked.mask(null);
        this.masked = null
    };
    this.setZ = function(b) {
        if (!this._parent) {
            throw "CanvasObject :: Must add to parent before setZ"
        }
        this._z = b;
        this._parent.children.sort(function(d, c) {
            return d._z - c._z
        })
    };
    this.hit = function(d) {
        if (!this.ignoreHit) {
            var c = Utils.hitTestObject(d, this.values.hit(this));
            if (c) {
                return this
            }
        }
        for (var b = this.children.length - 1; b > -1; b--) {
            var f = this.children[b];
            c = f.hit(d);
            if (c) {
                return f
            }
        }
        return false
    };
    this.destroy = function() {
        for (var b = 0; b < this.children.length; b++) {
            if (this.children[b].destroy) {
                this.children[b].destroy()
            }
        }
        return Utils.nullObject(this)
    }
});
Class(function CanvasValues(a) {
    Inherit(this, Component);
    var d = this;
    var c = {};
    var b = {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    };
    if (!a) {
        this.data = new Float32Array(6)
    } else {
        this.styled = false
    }
    this.set("shadowOffsetX", function(e) {
        d.styled = true;
        c.shadowOffsetX = e
    });
    this.get("shadowOffsetX", function() {
        return c.shadowOffsetX
    });
    this.set("shadowOffsetY", function(e) {
        d.styled = true;
        c.shadowOffsetY = e
    });
    this.get("shadowOffsetY", function() {
        return c.shadowOffsetY
    });
    this.set("shadowBlur", function(e) {
        d.styled = true;
        c.shadowBlur = e
    });
    this.get("shadowBlur", function() {
        return c.shadowBlur
    });
    this.set("shadowColor", function(e) {
        d.styled = true;
        c.shadowColor = e
    });
    this.get("shadowColor", function() {
        d.styled = true;
        return c.shadowColor
    });
    this.get("values", function() {
        return c
    });
    this.setTRSA = function(f, k, h, j, i, g) {
        var e = this.data;
        e[0] = f;
        e[1] = k;
        e[2] = h;
        e[3] = j;
        e[4] = i;
        e[5] = g
    };
    this.calculate = function(g) {
        var f = g.data;
        var e = this.data;
        e[0] = e[0] + f[0];
        e[1] = e[1] + f[1];
        e[2] = e[2] + f[2];
        e[3] = e[3] * f[3];
        e[4] = e[4] * f[4];
        e[5] = e[5] * f[5]
    };
    this.calculateStyle = function(g) {
        if (!g.styled) {
            return false
        }
        this.styled = true;
        var e = g.values;
        for (var f in e) {
            if (!c[f]) {
                c[f] = e[f]
            }
        }
    };
    this.hit = function(e) {
        b.x = this.data[0];
        b.y = this.data[1];
        b.width = e.width;
        b.height = e.height;
        return b
    }
});
Class(function CanvasPoints(e, a, d) {
    Inherit(this, CanvasObject);
    var f = this;
    this.graphics = new CanvasGraphics();
    this.type = "fill";
    this.points = [];
    this.width = a || 0;
    this.height = d || 0;
    this.line = "direct";
    (function() {
        b();
        Render.nextFrame(c)
    })();

    function b() {
        if (e) {
            for (var g = 0; g < e.length; g++) {
                f.points.push(e[g])
            }
        }
    }

    function c() {
        f.add(f.graphics)
    }
    this.draw = function() {
        if (this.points.length < 2) {
            return false
        }
        this.graphics.clear();
        this.graphics.beginPath();
        if (this.line == "direct") {
            this.graphics.moveTo(this.points[0].x, this.points[0].y);
            for (var g = 1; g < this.points.length; g++) {
                this.graphics.lineTo(this.points[g].x, this.points[g].y)
            }
        } else {
            for (var g = 1; g < this.points.length - 2; g++) {
                var h = (this.points[g].x + this.points[g + 1].x) / 2;
                var j = (this.points[g].y + this.points[g + 1].y) / 2;
                this.graphics.quadraticCurveTo(this.points[g].x, this.points[g].y, h, j)
            }
            this.graphics.quadraticCurveTo(this.points[g].x, this.points[g].y, this.points[g + 1].x, this.points[g + 1].y)
        }
        this.graphics[this.type]()
    };
    this.insert = function(h) {
        if (!h.splice) {
            h = [h]
        }
        for (var g = 0; g < h.length; g++) {
            this.points.push(h[g])
        }
    }
});
Class(function TweenManager() {
    var f = this;
    var a = [];
    var d, c;
    (function() {
        Hydra.ready(b);
        Render.startRender(e)
    })();

    function b() {
        f._dynamicPool = new ObjectPool(DynamicObject, 100)
    }

    function e(j) {
        if (a.length) {
            var g = a.length - 1;
            for (var h = g; h > -1; h--) {
                if (a[h]) {
                    a[h].update(j)
                } else {
                    a.splice(h, 1)
                }
            }
        }
    }
    this._addMathTween = function(g) {
        a.push(g)
    };
    this._removeMathTween = function(h) {
        for (var g = a.length - 1; g > -1; g--) {
            if (h == a[g]) {
                a.splice(g, 1)
            }
        }
    };
    this.tween = function(k, i, j, l, h, g, m) {
        if (typeof h !== "number") {
            m = g;
            g = h;
            h = 0
        }
        return new MathTween(k, i, j, l, h, m, g)
    };
    this.spring = function(k, i, j, h, g, l) {
        if (typeof h !== "number") {
            l = g;
            g = h;
            h = 0
        }
        return new SpringTween(k, i, j, "spring", h, g, l)
    };
    this.clearTween = function(g) {
        if (g._mathTween && g._mathTween.stop) {
            g._mathTween.stop()
        }
    };
    this.clearCSSTween = function(g) {
        if (g && !g._cssTween && g.div._transition) {
            g.div.style[Device.styles.vendorTransition] = "";
            g.div._transition = false
        }
    };
    this.checkTransform = function(h) {
        for (var g = f.Transforms.length - 1; g > -1; g--) {
            if (h == f.Transforms[g]) {
                return true
            }
        }
        return false
    };
    this.addCustomEase = function(j) {
        var h = true;
        if (typeof j !== "object" || !j.name || !j.curve) {
            throw "TweenManager :: setCustomEase requires {name, curve}"
        }
        for (var g = f.CSSEases.length - 1; g > -1; g--) {
            if (j.name == f.CSSEases[g].name) {
                h = false
            }
        }
        if (h) {
            j.values = j.curve.split("(")[1].slice(0, -1).split(",");
            for (g = 0; g < j.values.length; g++) {
                j.values[g] = parseFloat(j.values[g])
            }
            f.CSSEases.push(j)
        }
    };
    this.getEase = function(h, g) {
        var k = f.CSSEases;
        for (var j = k.length - 1; j > -1; j--) {
            if (k[j].name == h) {
                if (g) {
                    return k[j].values
                }
                return k[j].curve
            }
        }
        return false
    };
    this.getAllTransforms = function(g) {
        var k = {};
        for (var h = 0; h < f.Transforms.length; h++) {
            var j = f.Transforms[h];
            var l = g[j];
            if (l !== 0 && typeof l === "number") {
                k[j] = l
            }
        }
        return k
    };
    this.getTransformProperty = function() {
        switch (Device.styles.vendor) {
            case "Moz":
                return "-moz-transform";
                break;
            case "Webkit":
                return "-webkit-transform";
                break;
            case "O":
                return "-o-transform";
                break;
            case "ms":
                return "-ms-transform";
                break;
            default:
                return "transform";
                break
        }
    };
    this.parseTransform = function(i) {
        var h = "";
        var k = "";
        if (typeof i.x !== "undefined" || typeof i.y !== "undefined" || typeof i.z !== "undefined") {
            var g = (i.x || 0);
            var l = (i.y || 0);
            var j = (i.z || 0);
            k += g + "px, ";
            k += l + "px";
            if (Device.tween.css3d) {
                k += ", " + j + "px";
                h += "translate3d(" + k + ")"
            } else {
                h += "translate(" + k + ")"
            }
        }
        if (typeof i.scale !== "undefined") {
            h += "scale(" + i.scale + ")"
        } else {
            if (typeof i.scaleX !== "undefined") {
                h += "scaleX(" + i.scaleX + ")"
            }
            if (typeof i.scaleY !== "undefined") {
                h += "scaleY(" + i.scaleY + ")"
            }
        } if (typeof i.rotation !== "undefined") {
            h += "rotate(" + i.rotation + "deg)"
        }
        if (typeof i.rotationX !== "undefined") {
            h += "rotateX(" + i.rotationX + "deg)"
        }
        if (typeof i.rotationY !== "undefined") {
            h += "rotateY(" + i.rotationY + "deg)"
        }
        if (typeof i.rotationZ !== "undefined") {
            h += "rotateZ(" + i.rotationZ + "deg)"
        }
        if (typeof i.skewX !== "undefined") {
            h += "skewX(" + i.skewX + "deg)"
        }
        if (typeof i.skewY !== "undefined") {
            h += "skewY(" + i.skewY + "deg)"
        }
        return h
    };
    this.Class = window.Class
}, "Static");
Class(function MathTween(m, o, p, b, k, n, q) {
    var j = this;
    var d, a, h;
    var e, f, g;
    var l = 0;
    (function() {
        if (m && o) {
            if (typeof p !== "number") {
                throw "MathTween Requires object, props, time, ease"
            }
            c()
        }
    })();

    function c() {
        m._mathTween = j;
        TweenManager._addMathTween(j);
        b = TweenManager.MathEasing.convertEase(b);
        f = typeof b === "function";
        d = Date.now();
        d += k;
        h = o;
        a = TweenManager._dynamicPool.get();
        for (var r in h) {
            if (typeof m[r] === "number") {
                a[r] = m[r]
            }
        }
    }

    function i() {
        if (!m && !o) {
            return false
        }
        if (m) {
            m._mathTween = null
        }
        if (a) {
            TweenManager._dynamicPool.put(a.clear())
        }
        d = a = h = e = null;
        m = o = p = b = k = n = q = null;
        TweenManager._removeMathTween(j);
        Utils.nullObject(j)
    }
    this.update = function(t) {
        if (g || !m) {
            return false
        }
        if (t < d) {
            return true
        }
        l = (t - d) / p;
        l = l > 1 ? 1 : l;
        var s;
        if (f) {
            s = b(l)
        } else {
            s = TweenManager.MathEasing.solve(b, l)
        }
        for (var v in a) {
            if (typeof a[v] === "number") {
                var u = a[v];
                var r = h[v];
                m[v] = u + (r - u) * s
            }
        }
        if (n) {
            n(t)
        }
        if (l == 1) {
            if (!e) {
                e = true;
                if (q) {
                    q()
                }
                i()
            }
            return false
        }
        return true
    };
    this.pause = function() {
        g = true
    };
    this.resume = function() {
        g = false;
        d = Date.now() - (l * p)
    };
    this.stop = function() {
        i();
        return null
    }
});
TweenManager.Class(function MathEasing() {
    function d(i, g, h) {
        return ((a(g, h) * i + f(g, h)) * i + e(g)) * i
    }

    function b(k, n, l) {
        var h = k;
        for (var j = 0; j < 4; j++) {
            var m = c(h, n, l);
            if (m == 0) {
                return h
            }
            var g = d(h, n, l) - k;
            h -= g / m
        }
        return h
    }

    function c(i, g, h) {
        return 3 * a(g, h) * i * i + 2 * f(g, h) * i + e(g)
    }

    function a(g, h) {
        return 1 - 3 * h + 3 * g
    }

    function f(g, h) {
        return 3 * h - 6 * g
    }

    function e(g) {
        return 3 * g
    }
    this.convertEase = function(i) {
        var g = (function() {
            switch (i) {
                case "easeInQuad":
                    return TweenManager.MathEasing.Quad.In;
                    break;
                case "easeInCubic":
                    return TweenManager.MathEasing.Cubic.In;
                    break;
                case "easeInQuart":
                    return TweenManager.MathEasing.Quart.In;
                    break;
                case "easeInQuint":
                    return TweenManager.MathEasing.Quint.In;
                    break;
                case "easeInSine":
                    return TweenManager.MathEasing.Sine.In;
                    break;
                case "easeInExpo":
                    return TweenManager.MathEasing.Expo.In;
                    break;
                case "easeInCirc":
                    return TweenManager.MathEasing.Circ.In;
                    break;
                case "easeInElastic":
                    return TweenManager.MathEasing.Elastic.In;
                    break;
                case "easeInBack":
                    return TweenManager.MathEasing.Back.In;
                    break;
                case "easeInBounce":
                    return TweenManager.MathEasing.Bounce.In;
                    break;
                case "easeOutQuad":
                    return TweenManager.MathEasing.Quad.Out;
                    break;
                case "easeOutCubic":
                    return TweenManager.MathEasing.Cubic.Out;
                    break;
                case "easeOutQuart":
                    return TweenManager.MathEasing.Quart.Out;
                    break;
                case "easeOutQuint":
                    return TweenManager.MathEasing.Quint.Out;
                    break;
                case "easeOutSine":
                    return TweenManager.MathEasing.Sine.Out;
                    break;
                case "easeOutExpo":
                    return TweenManager.MathEasing.Expo.Out;
                    break;
                case "easeOutCirc":
                    return TweenManager.MathEasing.Circ.Out;
                    break;
                case "easeOutElastic":
                    return TweenManager.MathEasing.Elastic.Out;
                    break;
                case "easeOutBack":
                    return TweenManager.MathEasing.Back.Out;
                    break;
                case "easeOutBounce":
                    return TweenManager.MathEasing.Bounce.Out;
                    break;
                case "easeInOutQuad":
                    return TweenManager.MathEasing.Quad.InOut;
                    break;
                case "easeInOutCubic":
                    return TweenManager.MathEasing.Cubic.InOut;
                    break;
                case "easeInOutQuart":
                    return TweenManager.MathEasing.Quart.InOut;
                    break;
                case "easeInOutQuint":
                    return TweenManager.MathEasing.Quint.InOut;
                    break;
                case "easeInOutSine":
                    return TweenManager.MathEasing.Sine.InOut;
                    break;
                case "easeInOutExpo":
                    return TweenManager.MathEasing.Expo.InOut;
                    break;
                case "easeInOutCirc":
                    return TweenManager.MathEasing.Circ.InOut;
                    break;
                case "easeInOutElastic":
                    return TweenManager.MathEasing.Elastic.InOut;
                    break;
                case "easeInOutBack":
                    return TweenManager.MathEasing.Back.InOut;
                    break;
                case "easeInOutBounce":
                    return TweenManager.MathEasing.Bounce.InOut;
                    break;
                case "linear":
                    return TweenManager.MathEasing.Linear.None;
                    break
            }
        })();
        if (!g) {
            var h = TweenManager.getEase(i, true);
            if (h) {
                g = h
            } else {
                g = TweenManager.MathEasing.Cubic.Out
            }
        }
        return g
    };
    this.solve = function(h, g) {
        if (h[0] == h[1] && h[2] == h[3]) {
            return g
        }
        return d(b(g, h[0], h[2]), h[1], h[3])
    }
}, "Static");
(function() {
    TweenManager.MathEasing.Linear = {
        None: function(a) {
            return a
        }
    };
    TweenManager.MathEasing.Quad = {
        In: function(a) {
            return a * a
        },
        Out: function(a) {
            return a * (2 - a)
        },
        InOut: function(a) {
            if ((a *= 2) < 1) {
                return 0.5 * a * a
            }
            return -0.5 * (--a * (a - 2) - 1)
        }
    };
    TweenManager.MathEasing.Cubic = {
        In: function(a) {
            return a * a * a
        },
        Out: function(a) {
            return --a * a * a + 1
        },
        InOut: function(a) {
            if ((a *= 2) < 1) {
                return 0.5 * a * a * a
            }
            return 0.5 * ((a -= 2) * a * a + 2)
        }
    };
    TweenManager.MathEasing.Quart = {
        In: function(a) {
            return a * a * a * a
        },
        Out: function(a) {
            return 1 - --a * a * a * a
        },
        InOut: function(a) {
            if ((a *= 2) < 1) {
                return 0.5 * a * a * a * a
            }
            return -0.5 * ((a -= 2) * a * a * a - 2)
        }
    };
    TweenManager.MathEasing.Quint = {
        In: function(a) {
            return a * a * a * a * a
        },
        Out: function(a) {
            return --a * a * a * a * a + 1
        },
        InOut: function(a) {
            if ((a *= 2) < 1) {
                return 0.5 * a * a * a * a * a
            }
            return 0.5 * ((a -= 2) * a * a * a * a + 2)
        }
    };
    TweenManager.MathEasing.Sine = {
        In: function(a) {
            return 1 - Math.cos(a * Math.PI / 2)
        },
        Out: function(a) {
            return Math.sin(a * Math.PI / 2)
        },
        InOut: function(a) {
            return 0.5 * (1 - Math.cos(Math.PI * a))
        }
    };
    TweenManager.MathEasing.Expo = {
        In: function(a) {
            return a === 0 ? 0 : Math.pow(1024, a - 1)
        },
        Out: function(a) {
            return a === 1 ? 1 : 1 - Math.pow(2, -10 * a)
        },
        InOut: function(a) {
            if (a === 0) {
                return 0
            }
            if (a === 1) {
                return 1
            }
            if ((a *= 2) < 1) {
                return 0.5 * Math.pow(1024, a - 1)
            }
            return 0.5 * (-Math.pow(2, -10 * (a - 1)) + 2)
        }
    };
    TweenManager.MathEasing.Circ = {
        In: function(a) {
            return 1 - Math.sqrt(1 - a * a)
        },
        Out: function(a) {
            return Math.sqrt(1 - --a * a)
        },
        InOut: function(a) {
            if ((a *= 2) < 1) {
                return -0.5 * (Math.sqrt(1 - a * a) - 1)
            }
            return 0.5 * (Math.sqrt(1 - (a -= 2) * a) + 1)
        }
    };
    TweenManager.MathEasing.Elastic = {
        In: function(c) {
            var d, b = 0.1,
                e = 0.4;
            if (c === 0) {
                return 0
            }
            if (c === 1) {
                return 1
            }
            if (!b || b < 1) {
                b = 1;
                d = e / 4
            } else {
                d = e * Math.asin(1 / b) / (2 * Math.PI)
            }
            return -(b * Math.pow(2, 10 * (c -= 1)) * Math.sin((c - d) * (2 * Math.PI) / e))
        },
        Out: function(c) {
            var d, b = 0.1,
                e = 0.4;
            if (c === 0) {
                return 0
            }
            if (c === 1) {
                return 1
            }
            if (!b || b < 1) {
                b = 1;
                d = e / 4
            } else {
                d = e * Math.asin(1 / b) / (2 * Math.PI)
            }
            return (b * Math.pow(2, -10 * c) * Math.sin((c - d) * (2 * Math.PI) / e) + 1)
        },
        InOut: function(c) {
            var d, b = 0.1,
                e = 0.4;
            if (c === 0) {
                return 0
            }
            if (c === 1) {
                return 1
            }
            if (!b || b < 1) {
                b = 1;
                d = e / 4
            } else {
                d = e * Math.asin(1 / b) / (2 * Math.PI)
            } if ((c *= 2) < 1) {
                return -0.5 * (b * Math.pow(2, 10 * (c -= 1)) * Math.sin((c - d) * (2 * Math.PI) / e))
            }
            return b * Math.pow(2, -10 * (c -= 1)) * Math.sin((c - d) * (2 * Math.PI) / e) * 0.5 + 1
        }
    };
    TweenManager.MathEasing.Back = {
        In: function(a) {
            var b = 1.70158;
            return a * a * ((b + 1) * a - b)
        },
        Out: function(a) {
            var b = 1.70158;
            return --a * a * ((b + 1) * a + b) + 1
        },
        InOut: function(a) {
            var b = 1.70158 * 1.525;
            if ((a *= 2) < 1) {
                return 0.5 * (a * a * ((b + 1) * a - b))
            }
            return 0.5 * ((a -= 2) * a * ((b + 1) * a + b) + 2)
        }
    };
    TweenManager.MathEasing.Bounce = {
        In: function(a) {
            return 1 - TweenManager.MathEasing.Bounce.Out(1 - a)
        },
        Out: function(a) {
            if (a < (1 / 2.75)) {
                return 7.5625 * a * a
            } else {
                if (a < (2 / 2.75)) {
                    return 7.5625 * (a -= (1.5 / 2.75)) * a + 0.75
                } else {
                    if (a < (2.5 / 2.75)) {
                        return 7.5625 * (a -= (2.25 / 2.75)) * a + 0.9375
                    } else {
                        return 7.5625 * (a -= (2.625 / 2.75)) * a + 0.984375
                    }
                }
            }
        },
        InOut: function(a) {
            if (a < 0.5) {
                return TweenManager.MathEasing.Bounce.In(a * 2) * 0.5
            }
            return TweenManager.MathEasing.Bounce.Out(a * 2 - 1) * 0.5 + 0.5
        }
    }
})();
Class(function SpringTween(n, p, i, b, l, q, o) {
    var k = this;
    var d, f, h, a;
    var g, i, m, e;
    (function() {
        if (n && p) {
            if (typeof i !== "number") {
                throw "SpringTween Requires object, props, time, ease"
            }
            c()
        }
    })();

    function c() {
        TweenManager.clearTween(n);
        n._mathTween = k;
        TweenManager._addMathTween(k);
        d = Date.now();
        d += l;
        h = TweenManager._dynamicPool.get();
        a = TweenManager._dynamicPool.get();
        f = TweenManager._dynamicPool.get();
        m = 0;
        g = p.damping || 0.5;
        for (var r in p) {
            if (typeof p[r] === "number") {
                f[r] = 0;
                h[r] = p[r]
            }
        }
        for (var r in p) {
            if (typeof n[r] === "number") {
                a[r] = n[r] || 0;
                p[r] = a[r]
            }
        }
        delete p.damping
    }

    function j() {
        if (n) {
            n._mathTween = null;
            for (var r in h) {
                if (typeof h[r] === "number") {
                    n[r] = h[r]
                }
            }
            if (n.transform) {
                n.transform()
            }
        }
        TweenManager._dynamicPool.put(a.clear());
        TweenManager._dynamicPool.put(h.clear());
        TweenManager._dynamicPool.put(f.clear());
        d = a = h = e = null;
        n = p = i = b = l = q = null;
        TweenManager._removeMathTween(k)
    }
    this.update = function(u) {
        if (u < d) {
            return true
        }
        var t;
        for (var y in a) {
            if (typeof a[y] === "number") {
                var x = a[y];
                var s = h[y];
                var w = p[y];
                var v = s - w;
                var r = v * g;
                f[y] += r;
                f[y] *= i;
                p[y] += f[y];
                n[y] = p[y];
                t = f[y]
            }
        }
        if (Math.abs(t) < 0.01) {
            m++;
            if (m > 30 && !e) {
                e = true;
                if (q) {
                    q()
                }
                j();
                return false
            }
        }
        if (o) {
            o(u)
        }
        if (n.transform) {
            n.transform()
        }
        return true
    };
    this.stop = function() {
        j();
        return null
    }
});
Class(function CSSTween(p, A, D, l, u, s, r) {
    var z = this;
    var g, t, G, E, F;
    var f, q, d, j, o;
    var v, y, b, n;
    (function() {
        if (p && A) {
            if (typeof D !== "number") {
                throw "CSSTween Requires object, props, time, ease"
            }
            i()
        }
    })();

    function i() {
        if (c()) {
            B();
            if (!r) {
                k()
            }
        } else {
            if (!r) {
                e();
                h();
                a()
            }
        }
    }

    function h() {
        var H = TweenManager.getAllTransforms(p);
        var J = [];
        for (var I in A) {
            if (TweenManager.checkTransform(I)) {
                H.use = true;
                H[I] = A[I];
                delete A[I]
            } else {
                J.push(I)
            }
        }
        if (H.use) {
            J.push(TweenManager.getTransformProperty())
        }
        j = H;
        v = J
    }

    function B() {
        var H = TweenManager.getAllTransforms(p);
        E = TweenManager._dynamicPool.get();
        d = TweenManager._dynamicPool.get();
        q = TweenManager._dynamicPool.get();
        G = TweenManager._dynamicPool.get();
        for (var I in H) {
            q[I] = H[I];
            d[I] = H[I]
        }
        for (I in A) {
            if (TweenManager.checkTransform(I)) {
                y = true;
                q[I] = p[I] || 0;
                d[I] = A[I]
            } else {
                b = true;
                if (typeof A[I] === "string") {
                    p.div.style[I] = A[I]
                } else {
                    G[I] = Number(p.css(I));
                    E[I] = A[I]
                }
            }
        }
    }

    function c() {
        if (A.math) {
            delete A.math;
            return g = true
        }
        if (!Device.tween.transition) {
            return g = true
        }
        if (l.strpos("Elastic") || l.strpos("Bounce")) {
            return g = true
        }
        return g = false
    }

    function k() {
        p._cssTween = z;
        z.playing = true;
        A = G.copy();
        j = q.copy();
        if (b) {
            t = TweenManager.tween(A, E, D, l, u, w, x)
        }
        if (y) {
            o = TweenManager.tween(j, d, D, l, u, (!b ? w : null), (!b ? x : null))
        }
    }

    function a() {
        if (!z.kill && p.div && v) {
            p._cssTween = z;
            p.div._transition = true;
            var J = "";
            var H = v.length;
            for (var I = 0; I < H; I++) {
                J += (J.length ? ", " : "") + v[I] + " " + D + "ms " + TweenManager.getEase(l) + " " + u + "ms"
            }
            Render.setupTween(function() {
                if (z.kill || !p || !p.div) {
                    return false
                }
                p.div.style[Device.styles.vendorTransition] = J;
                p.css(A);
                p.transform(j);
                z.playing = true;
                if (s) {
                    setTimeout(s, D + u)
                }
                p.div.addEventListener(Device.tween.complete, m)
            })
        }
    }

    function m() {
        if (z.kill || !p || !p.div) {
            return false
        }
        w()
    }

    function x() {
        if (!z.kill && p && p.div) {
            p.css(A);
            p.transform(j)
        }
    }

    function e() {
        if (!p || !p.div) {
            return false
        }
        p.div.removeEventListener(Device.tween.complete, m);
        TweenManager.clearTween(p);
        z.playing = false
    }

    function C() {
        if (g) {
            TweenManager._dynamicPool.put(E.clear());
            TweenManager._dynamicPool.put(d.clear());
            TweenManager._dynamicPool.put(q.clear());
            TweenManager._dynamicPool.put(G.clear())
        }
        g = t = o = G = E = F = null;
        f = q = d = j = o = null;
        v = y = b = null;
        A = D = l = u = s = r = null;
        z.kill = false
    }

    function w() {
        if (z.playing) {
            p._cssTween = null;
            if (!g) {
                e()
            }
            z.playing = false;
            if (f) {
                f.play()
            }
            C()
        }
    }
    this.start = function(I, K, L, M, H, N, J) {
        p = I;
        A = K;
        D = L;
        l = M;
        u = H;
        s = N;
        r = J;
        z = this;
        i();
        return this
    };
    this.stop = function() {
        if (z.playing) {
            p.div.style[Device.styles.vendor + "Transition"] = "";
            p.div._transition = false;
            z.kill = true;
            p._cssTween = null;
            if (f) {
                f.stop()
            }
            if (g && t && t.stop) {
                t.stop()
            }
            if (g && o && o.stop) {
                o.stop()
            } else {
                e()
            }
            C()
        }
    };
    this.play = function(H) {
        if (!z.playing) {
            if (g) {
                if (!H) {
                    B()
                }
                k()
            } else {
                h();
                Render.nextFrame(a)
            }
        }
    };
    this.chain = function(H) {
        f = H;
        return f
    }
});
(function() {
    $.fn.transform = function(b) {
        TweenManager.clearCSSTween(this);
        if (Device.tween.css2d) {
            if (!b) {
                b = this
            } else {
                for (var a in b) {
                    if (typeof b[a] === "number") {
                        this[a] = b[a]
                    }
                }
            } if (!this._matrix) {
                this.div.style[Device.styles.vendorTransform] = TweenManager.parseTransform(b)
            } else {
                if (this._matrix.type == "matrix2") {
                    this._matrix.setTRS(this.x, this.y, this.rotation, this.scaleX || this.scale, this.scaleY || this.scale)
                } else {
                    this._matrix.setTRS(this.x, this.y, this.z, this.rotationX, this.rotationY, this.rotationZ, this.scaleX || this.scale, this.scaleY || this.scale, this.scaleZ || this.scale)
                }
                this.div.style[Device.styles.vendorTransform] = this._matrix.getCSS()
            }
        }
        return this
    };
    $.fn.useMatrix3D = function() {
        this._matrix = new Matrix4();
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.rotationX = 0;
        this.rotationY = 0;
        this.rotationZ = 0;
        this.scale = 1;
        return this
    };
    $.fn.useMatrix2D = function() {
        this._matrix = new Matrix2();
        this.x = 0;
        this.y = 0;
        this.rotation = 0;
        this.scale = 1;
        return this
    };
    $.fn.matrix = function(a) {
        this.div.style[Device.styles.vendorTransform] = a;
        return this
    };
    $.fn.accelerate = function() {
        this.__accelerated = true;
        if (!this.z) {
            this.z = 0;
            this.transform()
        }
    };
    $.fn.backfaceVisibility = function(a) {
        if (a) {
            this.div.style[CSS.prefix("BackfaceVisibility")] = "visible"
        } else {
            this.div.style[CSS.prefix("BackfaceVisibility")] = "hidden"
        }
    };
    $.fn.enable3D = function(b, a, c) {
        this.div.style[CSS.prefix("TransformStyle")] = "preserve-3d";
        if (b) {
            this.div.style[CSS.prefix("Perspective")] = b + "px"
        }
        if (typeof a !== "undefined") {
            a = typeof a === "number" ? a + "px" : a;
            c = typeof c === "number" ? c + "px" : c;
            this.div.style[CSS.prefix("PerspectiveOrigin")] = a + " " + c
        }
        return this
    };
    $.fn.disable3D = function() {
        this.div.style[CSS.prefix("TransformStyle")] = "";
        this.div.style[CSS.prefix("Perspective")] = "";
        return this
    };
    $.fn.transformPoint = function(a, d, c) {
        var b = "";
        if (typeof a !== "undefined") {
            b += (typeof a === "number" ? a + "px " : a)
        }
        if (typeof d !== "undefined") {
            b += (typeof d === "number" ? d + "px " : d)
        }
        if (typeof c !== "undefined") {
            b += (typeof c === "number" ? c + "px" : c)
        }
        this.div.style[CSS.prefix("TransformOrigin")] = b;
        return this
    };
    $.fn.tween = function(c, d, e, a, f, b) {
        if (typeof a === "boolean") {
            b = a;
            a = 0;
            f = null
        } else {
            if (typeof a === "function") {
                f = a;
                a = 0
            }
        } if (typeof f === "boolean") {
            b = f;
            f = null
        }
        if (!a) {
            a = 0
        }
        if (e == "spring") {
            return new SpringTween(this, c, d, e, a, f, b)
        } else {
            return new CSSTween(this, c, d, e, a, f)
        }
    };
    $.fn.clearTransform = function() {
        if (typeof this.x === "number") {
            this.x = 0
        }
        if (typeof this.y === "number") {
            this.y = 0
        }
        if (typeof this.z === "number") {
            this.z = 0
        }
        if (typeof this.scale === "number") {
            this.scale = 1
        }
        if (typeof this.scaleX === "number") {
            this.scaleX = 1
        }
        if (typeof this.scaleY === "number") {
            this.scaleY = 1
        }
        if (typeof this.rotation === "number") {
            this.rotation = 0
        }
        if (typeof this.rotationX === "number") {
            this.rotationX = 0
        }
        if (typeof this.rotationY === "number") {
            this.rotationY = 0
        }
        if (typeof this.rotationZ === "number") {
            this.rotationZ = 0
        }
        if (typeof this.skewX === "number") {
            this.skewX = 0
        }
        if (typeof this.skewY === "number") {
            this.skewY = 0
        }
        if (!this.__accelerated) {
            this.div.style[Device.styles.vendorTransform] = ""
        } else {
            this.accelerate()
        }
        return this
    };
    $.fn.stopTween = function() {
        if (this._cssTween) {
            this._cssTween.stop()
        }
        if (this._mathTween) {
            this._mathTween.stop()
        }
        return this
    }
})();
(function() {
    TweenManager.Transforms = ["scale", "scaleX", "scaleY", "x", "y", "z", "rotation", "rotationX", "rotationY", "rotationZ", "skewX", "skewY", ];
    TweenManager.CSSEases = [{
        name: "easeOutCubic",
        curve: "cubic-bezier(0.215, 0.610, 0.355, 1.000)"
    }, {
        name: "easeOutQuad",
        curve: "cubic-bezier(0.250, 0.460, 0.450, 0.940)"
    }, {
        name: "easeOutQuart",
        curve: "cubic-bezier(0.165, 0.840, 0.440, 1.000)"
    }, {
        name: "easeOutQuint",
        curve: "cubic-bezier(0.230, 1.000, 0.320, 1.000)"
    }, {
        name: "easeOutSine",
        curve: "cubic-bezier(0.390, 0.575, 0.565, 1.000)"
    }, {
        name: "easeOutExpo",
        curve: "cubic-bezier(0.190, 1.000, 0.220, 1.000)"
    }, {
        name: "easeOutCirc",
        curve: "cubic-bezier(0.075, 0.820, 0.165, 1.000)"
    }, {
        name: "easeOutBack",
        curve: "cubic-bezier(0.175, 0.885, 0.320, 1.275)"
    }, {
        name: "easeInCubic",
        curve: "cubic-bezier(0.550, 0.055, 0.675, 0.190)"
    }, {
        name: "easeInQuad",
        curve: "cubic-bezier(0.550, 0.085, 0.680, 0.530)"
    }, {
        name: "easeInQuart",
        curve: "cubic-bezier(0.895, 0.030, 0.685, 0.220)"
    }, {
        name: "easeInQuint",
        curve: "cubic-bezier(0.755, 0.050, 0.855, 0.060)"
    }, {
        name: "easeInSine",
        curve: "cubic-bezier(0.470, 0.000, 0.745, 0.715)"
    }, {
        name: "easeInCirc",
        curve: "cubic-bezier(0.600, 0.040, 0.980, 0.335)"
    }, {
        name: "easeInBack",
        curve: "cubic-bezier(0.600, -0.280, 0.735, 0.045)"
    }, {
        name: "easeInOutCubic",
        curve: "cubic-bezier(0.645, 0.045, 0.355, 1.000)"
    }, {
        name: "easeInOutQuad",
        curve: "cubic-bezier(0.455, 0.030, 0.515, 0.955)"
    }, {
        name: "easeInOutQuart",
        curve: "cubic-bezier(0.770, 0.000, 0.175, 1.000)"
    }, {
        name: "easeInOutQuint",
        curve: "cubic-bezier(0.860, 0.000, 0.070, 1.000)"
    }, {
        name: "easeInOutSine",
        curve: "cubic-bezier(0.445, 0.050, 0.550, 0.950)"
    }, {
        name: "easeInOutExpo",
        curve: "cubic-bezier(1.000, 0.000, 0.000, 1.000)"
    }, {
        name: "easeInOutCirc",
        curve: "cubic-bezier(0.785, 0.135, 0.150, 0.860)"
    }, {
        name: "easeInOutBack",
        curve: "cubic-bezier(0.680, -0.550, 0.265, 1.550)"
    }, {
        name: "linear",
        curve: "linear"
    }]
})();
Class(function Mouse() {
    var d = this;
    var b;
    this.x = 0;
    this.y = 0;

    function c(g) {
        d.ready = true;
        var f = Utils.touchEvent(g);
        d.x = f.x;
        d.y = f.y
    }

    function a() {
        d.x = d.y = 0
    }
    this.capture = function(e, f) {
        if (b) {
            return false
        }
        b = true;
        d.x = e || 0;
        d.y = f || 0;
        if (!Device.mobile) {
            __window.bind("mousemove", c)
        } else {
            __window.bind("touchend", a);
            __window.bind("touchmove", c);
            __window.bind("touchstart", c)
        }
    };
    this.stop = function() {
        if (!b) {
            return false
        }
        b = false;
        d.x = 0;
        d.y = 0;
        if (!Device.mobile) {
            __window.unbind("mousemove", c)
        } else {
            __window.unbind("touchend", a);
            __window.unbind("touchmove", c);
            __window.unbind("touchstart", c)
        }
    };
    this.preventClicks = function() {
        d._preventClicks = true;
        setTimeout(function() {
            d._preventClicks = false
        }, 500)
    };
    this.preventFireAfterClick = function() {
        d._preventFire = true
    }
}, "Static");
(function() {
    $.fn.click = function(d, a) {
        var c = this;

        function b(f) {
            if (!c.div) {
                return false
            }
            if (Mouse._preventClicks) {
                return false
            }
            f.object = c.div.className == "hit" ? c.parent() : c;
            f.action = "click";
            if (!f.pageX) {
                f.pageX = f.clientX;
                f.pageY = f.clientY
            }
            if (d) {
                d(f)
            }
            if (Mouse.autoPreventClicks) {
                Mouse.preventClicks()
            }
        }
        if (a) {
            if (this._events.click) {
                this.div[Hydra.removeEvent](Hydra.translateEvent("click"), this._events.click, true);
                this.div.style.cursor = "auto";
                this._events.click = null
            }
        } else {
            if (this._events.click) {
                this.click(null, true)
            }
            this.div[Hydra.addEvent](Hydra.translateEvent("click"), b, true);
            this.div.style.cursor = "pointer"
        }
        this._events.click = b;
        return this
    };
    $.fn.hover = function(g, a) {
        var f = this;
        var e = false;
        var d;

        function b(j) {
            if (!f.div) {
                return false
            }
            var i = Date.now();
            var h = j.toElement || j.relatedTarget;
            if (d && (i - d) < 5) {
                d = i;
                return false
            }
            d = i;
            j.object = f.div.className == "hit" ? f.parent() : f;
            switch (j.type) {
                case "mouseout":
                    j.action = "out";
                    break;
                case "mouseleave":
                    j.action = "out";
                    break;
                default:
                    j.action = "over";
                    break
            }
            if (e) {
                if (Mouse._preventClicks) {
                    return false
                }
                if (j.action == "over") {
                    return false
                }
                if (j.action == "out") {
                    if (c(f.div, h)) {
                        return false
                    }
                }
                e = false
            } else {
                if (j.action == "out") {
                    return false
                }
                e = true
            } if (!j.pageX) {
                j.pageX = j.clientX;
                j.pageY = j.clientY
            }
            if (g) {
                g(j)
            }
        }

        function c(l, j) {
            var h = l.children.length - 1;
            for (var k = h; k > -1; k--) {
                if (j == l.children[k]) {
                    return true
                }
            }
            for (k = h; k > -1; k--) {
                if (c(l.children[k], j)) {
                    return true
                }
            }
        }
        if (a) {
            if (this._events.hover) {
                this.div[Hydra.removeEvent](Hydra.translateEvent("mouseover"), this._events.hover, true);
                this.div[Hydra.removeEvent](Hydra.translateEvent("mouseout"), this._events.hover, true);
                this._events.hover = null
            }
        } else {
            if (this._events.hover) {
                this.hover(null, true)
            }
            this.div[Hydra.addEvent](Hydra.translateEvent("mouseover"), b, true);
            this.div[Hydra.addEvent](Hydra.translateEvent("mouseout"), b, true)
        }
        this._events.hover = b;
        return this
    };
    $.fn.press = function(d, a) {
        var c = this;

        function b(f) {
            if (!c.div) {
                return false
            }
            f.object = c.div.className == "hit" ? c.parent() : c;
            switch (f.type) {
                case "mousedown":
                    f.action = "down";
                    break;
                default:
                    f.action = "up";
                    break
            }
            if (!f.pageX) {
                f.pageX = f.clientX;
                f.pageY = f.clientY
            }
            if (d) {
                d(f)
            }
        }
        if (a) {
            if (this._events.press) {
                this.div[Hydra.removeEvent](Hydra.translateEvent("mousedown"), this._events.press, true);
                this.div[Hydra.removeEvent](Hydra.translateEvent("mouseup"), this._events.press, true);
                this._events.press = null
            }
        } else {
            if (this._events.press) {
                this.press(null, true)
            }
            this.div[Hydra.addEvent](Hydra.translateEvent("mousedown"), b, true);
            this.div[Hydra.addEvent](Hydra.translateEvent("mouseup"), b, true)
        }
        this._events.press = b;
        return this
    };
    $.fn.bind = function(b, f) {
        if (b == "touchstart") {
            if (!Device.mobile) {
                b = "mousedown"
            }
        } else {
            if (b == "touchmove") {
                if (!Device.mobile) {
                    b = "mousemove"
                }
            } else {
                if (b == "touchend") {
                    if (!Device.mobile) {
                        b = "mouseup"
                    }
                }
            }
        }
        this._events["bind_" + b] = this._events["bind_" + b] || [];
        var d = this._events["bind_" + b];
        var c = {};
        c.callback = f;
        c.target = this.div;
        d.push(c);

        function a(j) {
            var k = Utils.touchEvent(j);
            j.x = k.x;
            j.y = k.y;
            for (var g = 0; g < d.length; g++) {
                var h = d[g];
                if (h.target == j.currentTarget) {
                    h.callback(j)
                }
            }
        }
        if (!this._events["fn_" + b]) {
            this._events["fn_" + b] = a;
            this.div[Hydra.addEvent](Hydra.translateEvent(b), a, true)
        }
        return this
    };
    $.fn.unbind = function(a, e) {
        if (a == "touchstart") {
            if (!Device.mobile) {
                a = "mousedown"
            }
        } else {
            if (a == "touchmove") {
                if (!Device.mobile) {
                    a = "mousemove"
                }
            } else {
                if (a == "touchend") {
                    if (!Device.mobile) {
                        a = "mouseup"
                    }
                }
            }
        }
        var d = this._events["bind_" + a];
        if (!d) {
            return this
        }
        for (var b = 0; b < d.length; b++) {
            var c = d[b];
            if (c.callback == e) {
                d.splice(b, 1)
            }
        }
        if (this._events["fn_" + a] && !d.length) {
            this.div[Hydra.removeEvent](Hydra.translateEvent(a), this._events["fn_" + a], true);
            this._events["fn_" + a] = null
        }
        return this
    };
    $.fn.interact = function(c, a, b) {
        if (!this.hit) {
            this.hit = $(".hit");
            this.hit.css({
                width: "100%",
                height: "100%",
                zIndex: 99999,
                top: 0,
                left: 0,
                position: "absolute",
                background: "rgba(255, 255, 255, 0)"
            });
            this.addChild(this.hit)
        }
        if (!Device.mobile) {
            this.hit.hover(c).click(a)
        } else {
            this.hit.touchClick(!b ? c : null, a)
        }
    };
    Hydra.eventTypes = ["hover", "press", "click", "touchClick", "touchSwipe"];
    Hydra.translateEvent = function(a) {
        if (Hydra.addEvent == "attachEvent") {
            switch (a) {
                case "click":
                    return "onclick";
                    break;
                case "mouseover":
                    return "onmouseover";
                    break;
                case "mouseout":
                    return "onmouseleave";
                    break;
                case "mousedown":
                    return "onmousedown";
                    break;
                case "mouseup":
                    return "onmouseup";
                    break;
                case "mousemove":
                    return "onmousemove";
                    break
            }
        }
        return a
    }
})();
(function() {
    $.fn.attr = function(a, b) {
        if (a && b) {
            if (b == "") {
                this.div.removeAttribute(a)
            } else {
                this.div.setAttribute(a, b)
            }
        } else {
            if (a) {
                return this.div.getAttribute(a)
            }
        }
        return this
    };
    $.fn.val = function(a) {
        if (typeof a === "undefined") {
            return this.div.value
        } else {
            this.div.value = a
        }
        return this
    };
    $.fn.change = function(b) {
        var a = this;
        if (this._type == "select") {
            this.div.onchange = function() {
                b({
                    object: a,
                    value: a.div.value || ""
                })
            }
        }
    }
})();
(function() {
    $.fn.keypress = function(a) {
        this.div.onkeypress = function(b) {
            b = b || window.event;
            b.code = b.keyCode ? b.keyCode : b.charCode;
            a(b)
        }
    };
    $.fn.keydown = function(a) {
        this.div.onkeydown = function(b) {
            b = b || window.event;
            b.code = b.keyCode;
            a(b)
        }
    };
    $.fn.keyup = function(a) {
        this.div.onkeyup = function(b) {
            b = b || window.event;
            b.code = b.keyCode;
            a(b)
        }
    }
})();
Class(function Swipe() {
    var c;
    var b, a;
    this.max = 0;
    this.width = 100;
    this.currentSlide = 0;
    this.saveX = 0;
    this.currentX = 0;
    this.threshold = 0.1;
    this.minDist = 10;
    this.disableY = false;
    this._values = new Object();
    this.__slide = function(e) {
        var f = c.currentSlide;
        c.currentSlide += e;
        var d = -c.currentSlide * c.slideWidth;
        c.swipeContainer.tween({
            x: d
        }, 500, "easeOutCubic");
        c.currentX = d;
        if (f != c.currentSlide && c.slideComplete) {
            c.slideComplete(c.currentSlide)
        }
    };
    this.__start = function(d) {
        if ((!Device.mobile || d.touches.length == 1) && !a) {
            c.swiping = true;
            c.swipeContainer.stopTween();
            c._values.x = Utils.touchEvent(d).x;
            c._values.time = Date.now();
            if (Device.mobile) {
                __window.bind("touchmove", c.__move)
            } else {
                __window.bind("mousemove", c.__move)
            } if (c.disableY) {
                b = d.touches[0].pageY
            }
        }
    };
    this.__move = function(g) {
        if ((!Device.mobile || g.touches.length == 1) && !a) {
            if (c.disableY) {
                var i = Utils.touchEvent(g).y;
                if (Math.abs(i - b) > 25) {
                    a = true;
                    if (Device.mobile) {
                        __window.unbind("touchmove", c.__move)
                    } else {
                        __window.unbind("mousemove", c.__move)
                    }
                }
            }
            var d = Utils.touchEvent(g).x;
            var f = d - c._values.x;
            var h = c.saveX + f;
            if (h > 0) {
                f /= 2;
                c._values.snap = "left"
            } else {
                if (h < c.max) {
                    f /= 2;
                    c._values.snap = "right"
                } else {
                    c._values.snap = null
                }
            }
            c.currentX = c.saveX + f;
            c.swipeContainer.x = c.currentX;
            c.swipeContainer.transform();
            if (c.move) {
                c.move(c.currentX, c.currentSlide)
            }
        }
    };
    this.__end = function(j) {
        c.swiping = false;
        if (Device.mobile) {
            __window.unbind("touchmove", c.__move)
        } else {
            __window.unbind("mousemove", c.__move)
        }
        a = false;
        if (a) {
            c.__slide(0)
        } else {
            if (c._values.snap) {
                var f = 0;
                if (c._values.snap == "right") {
                    f = c.max
                }
                c.swipeContainer.tween({
                    x: f
                }, 500, "easeOutCubic");
                c.currentX = f;
                c._values.snap = null
            } else {
                var d = -(c.slideWidth * c.currentSlide + c.slideWidth / 2);
                var i = d + c.slideWidth;
                if (c.currentX < d) {
                    c.__slide(1)
                } else {
                    if (c.currentX > i) {
                        c.__slide(-1)
                    } else {
                        var h = Date.now();
                        var l = Utils.touchEvent(j).x - c._values.x;
                        var k = h - c._values.time;
                        var g = l / k;
                        if (Math.abs(l) >= c.minDist && Math.abs(g) > c.threshold) {
                            if (g < 0) {
                                c.__slide(1)
                            } else {
                                c.__slide(-1)
                            }
                        } else {
                            c.__slide(0)
                        }
                    }
                }
            }
        }
        c._values.x = c._values.time = null;
        c.saveX = c.currentX
    };
    this.addListeners = function(d) {
        c = this;
        c.slideWidth = c.width / c.slides;
        c.max = -c.width + c.slideWidth;
        c.swipeContainer = d;
        d.transform({
            x: 0
        });
        if (Device.mobile) {
            d.bind("touchstart", c.__start);
            __window.bind("touchend", c.__end);
            __window.bind("touchcancel", c.__touchCancel)
        } else {
            d.bind("mousedown", c.__start);
            __window.bind("mouseup", c.__end)
        }
    };
    this.removeListeners = function() {
        var d = c.swipeContainer;
        if (Device.mobile) {
            d.unbind("touchstart", c.__start);
            __window.unbind("touchend", c.__end);
            __window.unbind("touchcancel", c.__touchCancel)
        } else {
            d.unbind("mousedown", c.__start);
            __window.unbind("mouseup", c.__end)
        }
    }
});
(function() {
    $.fn.touchSwipe = function(i, c) {
        if (!window.addEventListener) {
            return this
        }
        var d = this;
        var a = 75;
        var k, j;
        var f = false;
        var e = Device.mobile;
        var l = {};
        if (e) {
            if (!c) {
                if (this._events.touchswipe) {
                    this.touchSwipe(null, true)
                }
                this.div.addEventListener("touchstart", b);
                this.div.addEventListener("touchend", h);
                this.div.addEventListener("touchcancel", h);
                this._events.touchswipe = true
            } else {
                this.div.removeEventListener("touchstart", b);
                this.div.removeEventListener("touchend", h);
                this.div.removeEventListener("touchcancel", h);
                this._events.touchswipe = false
            }
        }

        function b(m) {
            var n = Utils.touchEvent(m);
            if (!d.div) {
                return false
            }
            if (m.touches.length == 1) {
                k = n.x;
                j = n.y;
                f = true;
                d.div.addEventListener("touchmove", g)
            }
        }

        function g(o) {
            if (!d.div) {
                return false
            }
            if (f) {
                var p = Utils.touchEvent(o);
                var n = k - p.x;
                var m = j - p.y;
                l.direction = null;
                l.moving = null;
                l.x = null;
                l.y = null;
                l.evt = o;
                if (Math.abs(n) >= a) {
                    h();
                    if (n > 0) {
                        l.direction = "left"
                    } else {
                        l.direction = "right"
                    }
                } else {
                    if (Math.abs(m) >= a) {
                        h();
                        if (m > 0) {
                            l.direction = "up"
                        } else {
                            l.direction = "down"
                        }
                    } else {
                        l.moving = true;
                        l.x = n;
                        l.y = m
                    }
                } if (i) {
                    i(l)
                }
            }
        }

        function h(m) {
            if (!d.div) {
                return false
            }
            k = j = f = false;
            d.div.removeEventListener("touchmove", g)
        }
        return this
    };
    $.fn.touchClick = function(f, l, c) {
        if (!window.addEventListener) {
            return this
        }
        var d = this;
        var n, m;
        var e = Device.mobile;
        var h = this;
        var b = {};
        var g = {};
        if (f === null && l === true) {
            c = true
        }
        if (!c) {
            if (this._events.touchclick) {
                this.touchClick(null, null, true)
            }
            this._events.touchclick = true;
            if (e) {
                this.div.addEventListener("touchmove", i, false);
                this.div.addEventListener("touchstart", a, false);
                this.div.addEventListener("touchend", j, false)
            } else {
                this.div.addEventListener("mousedown", a, false);
                this.div.addEventListener("mouseup", j, false)
            }
        } else {
            if (e) {
                this.div.removeEventListener("touchmove", i, false);
                this.div.removeEventListener("touchstart", a, false);
                this.div.removeEventListener("touchend", j, false)
            } else {
                this.div.removeEventListener("mousedown", a, false);
                this.div.removeEventListener("mouseup", j, false)
            }
            this._events.touchclick = false
        }

        function i(o) {
            if (!d.div) {
                return false
            }
            g = Utils.touchEvent(o);
            if (Utils.findDistance(b, g) > 20) {
                m = true
            } else {
                m = false
            }
        }

        function k(o) {
            var p = Utils.touchEvent(o);
            o.touchX = p.x;
            o.touchY = p.y;
            b.x = o.touchX;
            b.y = o.touchY
        }

        function a(o) {
            if (!d.div) {
                return false
            }
            n = Date.now();
            o.preventDefault();
            o.action = "over";
            o.object = d.div.className == "hit" ? d.parent() : d;
            k(o);
            if (f) {
                f(o)
            }
        }

        function j(q) {
            if (!d.div) {
                return false
            }
            var p = Date.now();
            var o = false;
            q.object = d.div.className == "hit" ? d.parent() : d;
            k(q);
            if (n && p - n < 750) {
                if (Mouse._preventClicks) {
                    return false
                }
                if (l && !m) {
                    o = true;
                    q.action = "click";
                    if (l && !m) {
                        l(q)
                    }
                    if (Mouse.autoPreventClicks) {
                        Mouse.preventClicks()
                    }
                }
            }
            if (f) {
                q.action = "out";
                if (!Mouse._preventFire) {
                    f(q)
                }
            }
            m = false
        }
        return this
    }
})();
Mobile.Class(function Accelerometer() {
    var b = this;
    this.x = 0;
    this.y = 0;
    this.z = 0;

    function a(c) {
        switch (window.orientation) {
            case 0:
                b.x = -c.accelerationIncludingGravity.x;
                b.y = c.accelerationIncludingGravity.y;
                b.z = c.accelerationIncludingGravity.z;
                break;
            case 180:
                b.x = c.accelerationIncludingGravity.x;
                b.y = -c.accelerationIncludingGravity.y;
                b.z = c.accelerationIncludingGravity.z;
                break;
            case 90:
                b.x = c.accelerationIncludingGravity.y;
                b.y = c.accelerationIncludingGravity.x;
                b.z = c.accelerationIncludingGravity.z;
                break;
            case -90:
                b.x = -c.accelerationIncludingGravity.y;
                b.y = -c.accelerationIncludingGravity.x;
                b.z = c.accelerationIncludingGravity.z;
                break
        }
        if (c.rotationRate) {
            b.alpha = c.rotationRate.alpha;
            b.beta = c.rotationRate.beta;
            b.gamma = c.rotationRate.gamma
        }
    }
    this.capture = function() {
        window.ondevicemotion = a
    };
    this.stop = function() {
        window.ondevicemotion = null;
        b.x = b.y = b.z = 0
    }
}, "Static");
Class(function Video(m) {
    Inherit(this, Component);
    var i = this;
    var g, n, b, k, l, d;
    var c = 0;
    var e = {};
    this.loop = false;
    this.playing = false;
    this.width = m.width || 0;
    this.height = m.height || 0;
    (function() {
        j();
        a()
    })();

    function j() {
        var o = m.src;
        if (o && !o.strpos("webm") && !o.strpos("mp4") && !o.strpos("ogv")) {
            o += "." + Device.media.video
        }
        i.div = document.createElement("video");
        if (o) {
            i.div.src = o
        }
        i.div.controls = m.controls;
        i.div.id = m.id || "";
        i.div.width = m.width;
        i.div.height = m.height;
        d = i.div.loop = m.loop;
        if (!Device.mobile) {
            i.div.preload = true
        }
        i.object = $(i.div);
        i.width = m.width;
        i.height = m.height;
        i.object.size(i.width, i.height)
    }

    function a() {
        if (!Device.mobile && !Device.browser.ie) {
            i.div.play();
            setTimeout(function() {
                i.div.pause()
            }, 1)
        }
    }

    function f() {
        if (!i.div || !i.events) {
            return Render.stopRender(f)
        }
        i.duration = i.div.duration;
        i.time = i.div.currentTime;
        if (i.div.currentTime == b && i.div.currentTime > 0 && i.div.readyState == i.div.HAVE_ENOUGH_DATA) {
            c++;
            if (c > 60 && !k) {
                k = true;
                i.events.fire(HydraEvents.ERROR, null, true)
            }
        } else {
            c = 0;
            if (k) {
                i.events.fire(HydraEvents.READY, null, true);
                k = false
            }
        }
        b = i.div.currentTime;
        if (i.div.currentTime >= i.div.duration - 0.001) {
            if (!d) {
                Render.stopRender(f);
                i.events.fire(HydraEvents.COMPLETE, null, true)
            }
        }
        e.time = i.div.currentTime;
        e.duration = i.div.duration;
        i.events.fire(HydraEvents.UPDATE, e, true)
    }

    function h() {
        if (!Device.mobile) {
            if (!l) {
                i.buffered = i.div.readyState == i.div.HAVE_ENOUGH_DATA
            } else {
                var o = -1;
                var q = i.div.seekable;
                if (q) {
                    for (var p = 0; p < q.length; p++) {
                        if (q.start(p) < l) {
                            o = q.end(p) - 0.5
                        }
                    }
                    if (o >= l) {
                        i.buffered = true
                    }
                } else {
                    i.buffered = true
                }
            }
        } else {
            i.buffered = true
        } if (i.buffered) {
            Render.stopRender(h);
            i.events.fire(HydraEvents.READY, null, true)
        }
    }
    this.set("loop", function(o) {
        if (!i.div) {
            return
        }
        d = o;
        i.div.loop = o
    });
    this.get("loop", function() {
        return d
    });
    this.set("src", function(o) {
        if (o && !o.strpos("webm") && !o.strpos("mp4") && !o.strpos("ogv")) {
            o += "." + Device.media.video
        }
        i.div.src = o
    });
    this.play = function() {
        if (!i.div) {
            return false
        }
        if (!Device.mobile || Mobile.os == "Android") {
            if (i.ready()) {
                i.playing = true;
                i.div.play();
                Render.startRender(f)
            } else {
                setTimeout(i.play, 10)
            }
        } else {
            i.playing = true;
            i.div.play();
            Render.startRender(f)
        }
    };
    this.pause = function() {
        if (!i.div) {
            return false
        }
        i.playing = false;
        i.div.pause();
        Render.stopRender(f)
    };
    this.stop = function() {
        i.playing = false;
        Render.stopRender(f);
        if (!i.div) {
            return false
        }
        i.div.pause();
        i.div.currentTime = 0
    };
    this.volume = function(o) {
        if (!i.div) {
            return false
        }
        i.div.volume = o
    };
    this.seek = function(o) {
        if (!i.div) {
            return false
        }
        if (i.div.readyState <= 1) {
            return setTimeout(function() {
                i.seek(o)
            }, 10)
        }
        i.div.currentTime = o
    };
    this.canPlayTo = function(o) {
        l = null;
        if (o) {
            l = o
        }
        if (!i.div) {
            return false
        }
        if (!i.buffered) {
            Render.startRender(h)
        }
        return this.buffered
    };
    this.ready = function() {
        if (!i.div) {
            return false
        }
        return i.div.readyState >= i.div.HAVE_FUTURE_DATA
    };
    this.size = function(o, p) {
        if (!i.div) {
            return false
        }
        this.div.width = this.width = o;
        this.div.height = this.height = p;
        this.object.size(o, p)
    };
    this.destroy = function() {
        this.stop();
        this.object.remove();
        return this._destroy()
    }
});
Class(function Webcam(a, d, b) {
    Inherit(this, Component);
    var h = this;
    (function() {
        f();
        e()
    })();

    function f() {
        h.div = document.createElement("video");
        h.div.width = a;
        h.div.height = d;
        h.div.autoplay = true;
        h.element = $(h.div)
    }

    function e() {
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
        navigator.getUserMedia({
            video: true,
            audio: b
        }, g, c)
    }

    function g(i) {
        h.div.src = window.URL.createObjectURL(i);
        h.events.fire(HydraEvents.READY, null, true);
        h.element.show()
    }

    function c() {
        h.events.fire(HydraEvents.ERROR, null, true)
    }
    this.size = function(i, j) {
        h.div.width = a = i;
        h.div.height = d = j;
        if (h.canvas) {
            h.canvas.resize(i, j)
        }
    };
    this.getPixels = function() {
        if (!h.canvas) {
            h.canvas = h.initClass(Canvas, a, d, null)
        }
        h.canvas.context.drawImage(h.div, 0, 0, a, d);
        return h.canvas.context.getImageData(0, 0, a, d)
    };
    this.destroy = function() {
        g = c = null;
        return this._destroy()
    }
});
Class(function GATracker() {
    this.trackPage = function(a) {
        if (typeof ga !== "undefined") {
            ga("send", "pageview", a)
        }
    };
    this.trackEvent = function(b, d, a, c) {
        if (typeof ga !== "undefined") {
            ga("send", "event", b, d, a, (c || 0))
        }
    }
}, "Static");
Class(function DataVisConfig() {
    var a = this;
    a.COLORS = {
        grey: "#6c6d70",
        mint: "#67ebc9",
        blue: "#6d9bb8",
        peach: "#ef6751",
        pink: "#e476bf",
        green: "#84b784",
        yellow: "#faeb3e"
    };
    a.MODULES = [{
        title: "About",
        type: "text",
        content: {
            text: 'Explore science data from ISEE-3â€™s re-activated instruments. <a href="https://plus.google.com/110871408384252629393/posts" target="_blank">Follow the mission</a> for the latest status on new instruments and available science data posted here.'
        }
    }, {
        title: "Latest Sync",
        type: "status",
        content: [{
            label: "date",
            value: "08/01/2014",
            color: a.COLORS.peach
        }, {
            label: "time",
            value: "12:38:54",
            color: a.COLORS.peach
        }, {
            label: "Time zone",
            value: "UTC",
            color: a.COLORS.peach
        }]
    }, {
        title: "Beta Angle (Degrees)",
        type: "graph",
        content: {
            img: "angle",
            label: "DAILY AVERAGE"
        }
    }, {
        title: "SOLAR Array Current (Amps)",
        type: "number",
        content: {
            label: "DAILY AVERAGE",
            value: "4.8",
            color: a.COLORS.pink
        }
    }, {
        title: "Magnetometer XY (NT)",
        perma: "magnetometer",
        type: "graph",
        content: {
            img: "magnet"
        },
        info: [{
            type: "title",
            title: "MAGNETOMETER"
        }, {
            type: "paragraph",
            text: 'Like a 3D compass, a magnetometer measures magnetic fields in space from Earth and every other celestial body. It detects direction and magnitude, and this information tells scientists important information about the relationship of planets in our solar system. <a href="http://nssdc.gsfc.nasa.gov/nmc/experimentDisplay.do?id=1978-079A-02" target="_blank">The ISEE-3 magnetometer</a> measures in an x,y and z axis. Currently it seems its z axis is malfunctioning, so its data represents the remaining axes. Magnetometers are usually so sensitive they have to be placed at the end of an antenna to avoid picking up the satelliteâ€™s own magnetic current. '
        }, {
            type: "video",
            hd: true,
            img: "vid-thumbnail",
            id: "P7nhgX0ppek",
            title: "MAGNETIC FIELD: AN INTRODUCTION",
            copy: "European Space Agency, ESA"
        }, {
            type: "title",
            title: "WHAT IS A MAGNETIC FIELD?"
        }, {
            type: "paragraph",
            text: "Earthâ€™s magnetic field extends from the molten iron alloy of the outer core of Earthâ€™s interior into space. Itâ€™s usually measured in Gauss, named after the scientist Carl Friedrich Gauss who first studied it in 1835. Earthâ€™s magnetic field continues in space until it interacts with the interplanetary magnetic field from the Sun, which is made up of plasma and carried by the solar wind throughout our universe. Without our own magnetic field, we would have no magnetosphere - and no protection from the Sunâ€™s constantly bombarding energy. "
        }, {
            type: "title",
            title: "GET THE DATA"
        }, {
            type: "paragraph",
            text: 'Stay <a href="https://plus.google.com/110871408384252629393" target="_blank">updated</a> for open and accessible ISEE-3 data to do your own citizen science work.'
        }, {
            type: "download-links",
            links: [{
                title: "DOWNLOAD",
                url: ""
            }]
        }, {
            type: "title",
            title: "PUBLICATIONS"
        }, {
            type: "paragraph",
            text: 'View <a href="http://scholar.google.com/scholar?q=ISEE-3+magnetic+field&btnG=&hl=en&as_sdt=0%2C33" target="_blank">academic publications</a> written about the ISEE-3â€™s magnetometer.'
        }]
    }, {
        title: "Spin Rate",
        type: "spin",
        content: {
            label: "RPM",
            value: 19.76,
            color: a.COLORS.blue
        }
    }, {
        title: "SOLAR Array Temperature",
        type: "number",
        content: {
            label: "DAILY AVERAGE",
            value: "9.6",
            color: a.COLORS.yellow,
            degrees: true
        }
    }, {
        title: "Protons (H/Log counts)",
        perma: "protons",
        type: "graph",
        content: {
            img: "protons"
        },
        info: [{
            type: "title",
            title: "LOW-ENERGY PROTON EXPERIMENT"
        }, {
            type: "paragraph",
            text: "This experiment was designed to study low-energy solar protons in interplanetary space. Protons vary in density, temperature and speed and flow outward supersonically, from the Sun. The instrument consists of three identical telescopes mounted at 30, 60 and 135 degrees relative to the spacecraft spin axis, and utilizes a â€œbroomâ€ magnet to sweep away electrons. "
        }, {
            type: "video",
            img: "vid-thumbnail",
            id: "2zOlkIyg3iE",
            title: "Solar Wind and how it affects the Earth",
            copy: "European Space Agency, ESA"
        }, {
            type: "title",
            title: "WHAT IS THE SOLAR WIND?"
        }, {
            type: "paragraph",
            text: "Powerful magnetic fields on the Sun are constantly looping above its surface in every direction. When they come in contact with each other, they release a storm of highly charged particles that blast out into space like wind - consisting of a stream of extremely hot plasma matter, mostly electrons and protons. Earthâ€™s magnetosphere deflects this energy, creating accumulations of protons in Earthâ€™s radiation belt. "
        }, {
            type: "title",
            title: "GET THE DATA"
        }, {
            type: "paragraph",
            text: 'Stay <a href="https://plus.google.com/110871408384252629393" target="_blank">updated</a> for open and accessible ISEE-3 data to do your own citizen science work.'
        }, {
            type: "title",
            title: "PUBLICATIONS"
        }, {
            type: "paragraph",
            text: 'View <a href="http://scholar.google.com/scholar?hl=en&q=isee-3+solar+wind&btnG=&as_sdt=1%2C33&as_sdtp=" target="_blank">academic publications</a> written about the ISEE-3â€™s magnetometer.'
        }]
    }]
}, "Static");
Class(function Config() {
    var a = this;
    this.CDN = "";
    this.IMAGES = "assets/images/";
    this.SOUNDS = "assets/sounds/";
    this.VIDEO_FOLDER = "http://storage.googleapis.com/gweb-contact.appspot.com/";
    if (window.location.href.strpos("local")) {
        this.VIDEO_FOLDER = "assets/video/"
    }
    this.DEBUG = true;
    this.MUTE = false;
    this.TITLES = true;
    this.HANGOUT = false;
    this.HANGOUT_ID = "SdtUIXPjVgk";
    this.RECORD_MOBILE = window.location.search == "?screencap";
    this.CLEAN_HANGOUT = window.location.search == "?hangout";
    this.DATA = window.location.href.strpos("gweb") || window.location.href.strpos("spacecraftforall") ? "assets/data/data.json" : "http://satellite.activetheorylab.net/api/data/raw";
    this.MOBILE_OFFSET = 9.29;
    this.TIMELINE_HEIGHT = 50;
    this.DURATION = 668.0381;
    this.TIMELINE = [{
        colors: ["#82b882", "#ffe800"],
        date: 1978,
        text: "1978",
        perma: "a-new-orbit"
    }, {
        colors: ["#ff9900", "#f06751"],
        date: 1982,
        text: "1982",
        perma: "comet-chaser"
    }, {
        colors: ["#6b9bba", "#7970b1"],
        date: 1986,
        text: "1986",
        perma: "changing-times"
    }, {
        colors: ["#e673c0", "#b6c2c6"],
        date: 2011.5,
        text: "2014",
        perma: "contact"
    }, {
        colors: ["#9bdacf", "#000"],
        date: 2015,
        text: "TODAY",
        perma: "a-new-era"
    }];
    this.SHARE_TITLE = "â€œA Spacecraft for Allâ€: The Journey of the ISEE-3.";
    this.SHARE_URL = "http://www.spacecraftforall.com";
    this.SHARE_DESCRIPTION = "Launch into space with a Chrome Experiment that follows the entire 36-year-long odyssey of the ISEE-3. See its entire path as an interactive documentary, read its instruments, and view its live trajectory and position as it flies through interplanetary space.";
    this.TWITTER_TEXT = "â€œA Spacecraft for Allâ€: A Chrome Experiment that follows the amazing 36-year-long journey of the #ISEE3";
    this.SHARE = (function(e) {
        var g = encodeURIComponent(a.SHARE_TITLE);
        var b = encodeURIComponent(a.SHARE_URL);
        var f = encodeURIComponent(a.SHARE_DESCRIPTION);
        var d = encodeURIComponent(a.TWITTER_TEXT);
        var c;
        switch (e) {
            case "facebook":
                c = {
                    method: "feed",
                    name: a.SHARE_TITLE,
                    link: a.SHARE_URL,
                    picture: "http://spacecraftforall.com/assets/images/common/share.jpg",
                    description: a.SHARE_DESCRIPTION
                };
                break;
            case "twitter":
                c = "https://twitter.com/intent/tweet?text=" + d + "&url=" + b;
                break;
            case "google":
                c = {
                    contenturl: a.SHARE_URL,
                    clientid: "823336162978-4lpacp7p4uisks1de2410gq55512q126.apps.googleusercontent.com",
                    cookiepolicy: "single_host_origin",
                    prefilltext: a.SHARE_DESCRIPTION,
                    calltoactionlabel: "VISIT",
                    calltoactionurl: a.SHARE_URL
                };
                break
        }
        return c
    });
    if (!window.location.href.strpos("local")) {
        this.DEBUG = false;
        this.MUTE = false
    }
    this.PLAYGROUND = {
        space: {
            compositor: "CompositorBasic",
            base: "PlaygroundSpace"
        },
        earth: {
            compositor: "CompositorBasic",
            base: "PlaygroundEarth"
        },
        trajectory: {
            compositor: "CompositorBasic",
            base: "PlaygroundTrajectory"
        },
        title: {
            compositor: "CompositorBasic",
            base: "PlaygroundTitle"
        },
        moon: {
            compositor: "CompositorBasic",
            base: "PlaygroundMoon"
        },
        sun: {
            compositor: "CompositorBasic",
            base: "PlaygroundSun"
        },
        comet: {
            compositor: "CompositorBasic",
            base: "PlaygroundComet"
        },
        satellite: {
            compositor: "CompositorBasic",
            base: "PlaygroundSatellite"
        },
        stars: {
            compositor: "CompositorBasic",
            base: "PlaygroundStars"
        },
        live: {
            compositor: "CompositorBasic",
            base: "PlaygroundLive",
        }
    };
    this.CONSTANTS = {
        EARTH_RADIUS: 6378,
        EARTH_SUN_DISTANCE: 149597870.7 * 1.014,
        EARTH_MOON_DISTANCE: 384400,
        SUN_RADIUS: 695500,
        MOON_RADIUS: 1737,
        NEAREST_STAR: 39900000000000,
        LIVE_SCALE: 0.001,
        AU: 149597870.7,
        L1_DISTANCE: 1496408.5288521084,
    };
    this.DEFAULT_TRAJECTORY_COLORS = [{
        x: 0.37,
        y: 0.4,
        z: 0.3
    }, {
        x: 1,
        y: 0.6,
        z: 0
    }, {
        x: 1,
        y: 0.6,
        z: 0
    }, {
        x: 0.94,
        y: 0.4,
        z: 0.32
    }, {
        x: 0.42,
        y: 0.61,
        z: 0.73
    }, {
        x: 0.47,
        y: 0.44,
        z: 0.69
    }, {
        x: 0.9,
        y: 0.45,
        z: 0.75
    }, {
        x: 0.68,
        y: 0.68,
        z: 0.78
    }, {
        x: 0.4,
        y: 0.92,
        z: 0.79
    }];
    this.PATH_GEOMETRY = {
        satellite_smooth: {
            segments: 4500,
            radius: 15,
            scale: 0.001,
            colorStops: [0.163 * 3, 0.18 * 3, 0.22 * 3, 0.251 * 3, 0.3 * 3, 0.36 * 3, 0.4 * 3, 0.95 * 3, 1 * 3, ]
        },
        satellite_all: {
            segments: 1985 * 5,
            radius: 20,
            scale: 0.001,
            colorStops: [0.163, 0.18, 0.22, 0.251, 0.31, 0.37, 0.4, 0.995, 1, ]
        },
        moon: {
            startDate: new Date("29 Jul 2014 17:59:42 GMT").getTime(),
            endDate: new Date("03 Aug 2015 04:59:42 GMT").getTime(),
            segments: 1000,
            radius: 0.0001,
            scale: this.CONSTANTS.LIVE_SCALE,
            colorStops: [0, 1],
            colors: [{
                x: 0.2,
                y: 0.2,
                z: 0.2
            }, {
                x: 0.2,
                y: 0.2,
                z: 0.2
            }],
            ydir: -1,
            xdir: -1,
            zdir: 1
        },
        satellite_future: {
            startDate: new Date("01 Aug 2014 01:00:00 GMT").getTime(),
            endDate: new Date("11 Sep 2014 23:00:00 GMT").getTime(),
            segments: 1000,
            radius: 5,
            scale: this.CONSTANTS.LIVE_SCALE,
            colorStops: [0, 0.21 + 0.05, 0.23 + 0.05, 0.25 + 0.05, 0.9, 1],
            colors: [{
                x: 0,
                y: 0,
                z: 0
            }, {
                x: 0.9,
                y: 0.45,
                z: 0.75
            }, {
                x: 0.68,
                y: 0.68,
                z: 0.78
            }, {
                x: 0.4,
                y: 0.92,
                z: 0.79
            }, {
                x: 0,
                y: 0,
                z: 0
            }],
            ydir: -1,
            xdir: -1,
            zdir: 1
        }
    };
    (function() {
        var b = Utils.convertRange(Date.now(), a.PATH_GEOMETRY.satellite_future.startDate, a.PATH_GEOMETRY.satellite_future.endDate, 0, 1);
        a.PATH_GEOMETRY.satellite_future.colorStops[1] = b - 0.02;
        a.PATH_GEOMETRY.satellite_future.colorStops[2] = b - 0;
        a.PATH_GEOMETRY.satellite_future.colorStops[3] = b + 0.01
    }());
    this.FONTS = {
        primary: "Roboto Condensed"
    };
    this.DATAMODULES = DataVisConfig.MODULES;
    this.DATACOLORS = DataVisConfig.COLORS
}, "Static");
window.Config = window.Config || {};
window.Config.ASSETS = ["assets/images/about/arrow.png", "assets/images/about/diagram-left.png", "assets/images/about/diagram-right.png", "assets/images/about/icons/app-engine.png", "assets/images/about/icons/chrome.png", "assets/images/about/icons/device-orientation.png", "assets/images/about/icons/hangouts-on-air.png", "assets/images/about/icons/three-js.png", "assets/images/about/icons/webaudio.png", "assets/images/about/icons/webgl.png", "assets/images/about/logos/active-theory.png", "assets/images/about/logos/chrome.png", "assets/images/about/logos/flies-collective.png", "assets/images/about/logos/made-with.png", "assets/images/about/logos/nice-shoes.png", "assets/images/about/logos/reuter.png", "assets/images/about/logos/skycorp.png", "assets/images/about/logos/sound-lounge.png", "assets/images/about/logos/space-college.png", "assets/images/about/logos/spaceref.png", "assets/images/about/logos/stockton-stockton.png", "assets/images/about/slides/0.jpg", "assets/images/about/slides/1.jpg", "assets/images/about/slides/2.jpg", "assets/images/about/slides/3.jpg", "assets/images/about/x.png", "assets/images/colors/000.png", "assets/images/colors/333.png", "assets/images/colors/fff.png", "assets/images/common/buffer.png", "assets/images/common/chrome.png", "assets/images/common/cursors/info.png", "assets/images/common/cursors/move.png", "assets/images/common/gradient.png", "assets/images/common/hamburger.png", "assets/images/common/info.png", "assets/images/common/info2x.png", "assets/images/common/move.png", "assets/images/common/move2x.png", "assets/images/common/pause.png", "assets/images/common/play.png", "assets/images/common/ring.png", "assets/images/common/satellite.png", "assets/images/data/_archive/graph1.png", "assets/images/data/_archive/graph2.png", "assets/images/data/_archive/graph3.png", "assets/images/data/_archive/graph4.png", "assets/images/data/_archive/graph5.png", "assets/images/data/custom/spin.png", "assets/images/data/disabled.png", "assets/images/data/graphs/angle.png", "assets/images/data/graphs/magnet.png", "assets/images/data/graphs/protons.png", "assets/images/data/info/magnometer.png", "assets/images/data/info/vid-play-button.png", "assets/images/data/info/vid-thumbnail.jpg", "assets/images/data/info-icon.png", "assets/images/elements/common/particle.png", "assets/images/elements/earth/earth-clouds-alpha.png", "assets/images/elements/earth/earth-texture.jpg", "assets/images/elements/l1.png", "assets/images/elements/moon/moon.jpg", "assets/images/elements/moon/normal.jpg", "assets/images/elements/ring.png", "assets/images/error/bg.png", "assets/images/error/chrome.png", "assets/images/error/error.png", "assets/images/error/glow.png", "assets/images/error/landscape.png", "assets/images/error/noscript.png", "assets/images/error/spin.png", "assets/images/error/webgl.png", "assets/images/footer/icons/facebook.png", "assets/images/footer/icons/google.png", "assets/images/footer/icons/twitter.png", "assets/images/footer/logo.png", "assets/images/glows/comet.png", "assets/images/glows/earth.png", "assets/images/glows/sun.png", "assets/images/icon/apple-touch-icon-114x114-precomposed.png", "assets/images/icon/apple-touch-icon-144x144-precomposed.png", "assets/images/icon/apple-touch-icon-72x72-precomposed.png", "assets/images/icon/favicon_144x144.png", "assets/images/icon/favicon_32x32.png", "assets/images/icon/favicon_64x64.png", "assets/images/intro/banner.jpg", "assets/images/intro/banner.png", "assets/images/intro/phone-bg.jpg", "assets/images/intro/tablet-bg.jpg", "assets/images/intro/tout.png", "assets/images/labels/1978.png", "assets/images/labels/1982.png", "assets/images/labels/1986.png", "assets/images/labels/2014.png", "assets/images/labels/arecibo-type.png", "assets/images/labels/aug10.png", "assets/images/labels/aug12.png", "assets/images/labels/aug20.png", "assets/images/labels/aug5.png", "assets/images/labels/date2.png", "assets/images/labels/jul31.png", "assets/images/labels/july24.png", "assets/images/labels/sep2.png", "assets/images/live/banner-hover.png", "assets/images/live/banner.png", "assets/images/live/expand.png", "assets/images/live/hangout-label.png", "assets/images/live/hangout-top.png", "assets/images/live/live-label.png", "assets/images/live/minimize.png", "assets/images/share/share.jpg", "assets/images/timeline/logo.png", "assets/images/timeline/node-bg.png", "assets/images/timeline/node-outline.png", "assets/images/timeline/node.png", "assets/images/timeline/shadow.png", "assets/images/titles/title1.png", "assets/images/titles/title2.png", "assets/images/titles/title3.png", "assets/images/titles/title4.png", "assets/images/titles/title5.png", "assets/js/lib/three.js", "assets/geometry/moon.csv", "assets/geometry/satellite_all.csv", "assets/geometry/satellite_future.csv", "assets/geometry/satellite_model.json", "assets/geometry/satellite_small.json", "assets/geometry/satellite_smooth.csv", "assets/shaders/BasicVertex.vs", "assets/shaders/CometRock.fs", "assets/shaders/CometRock.vs", "assets/shaders/CometTrail.fs", "assets/shaders/CometTrail.vs", "assets/shaders/Earth.fs", "assets/shaders/Earth.vs", "assets/shaders/Hedron.fs", "assets/shaders/Hedron.vs", "assets/shaders/Moon.fs", "assets/shaders/Moon.vs", "assets/shaders/MoonBump.fs", "assets/shaders/MoonBump.vs", "assets/shaders/Satellite.fs", "assets/shaders/Satellite.vs", "assets/shaders/SceneOpacity.fs", "assets/shaders/Stars.fs", "assets/shaders/Stars.vs", "assets/shaders/TextureShader.fs", "assets/shaders/Trajectory.fs", "assets/shaders/Trajectory.vs", "assets/shaders/VideoShader.fs", "assets/shaders/VideoShader.vs"];
Class(function ContactEvents() {
    this.DATA_READY = "data_ready";
    this.BEGIN = "begin";
    this.NAV_CLICK = "nav_click";
    this.TIMELINE_SEEK = "timeline_seek";
    this.DATA_CLOSE = "data_close";
    this.RESET_3D = "reset_3d";
    this.PAUSE = "pause";
    this.RESUME = "resume";
    this.PLAY_PAUSE = "play_pause";
    this.DUMP_TWEENS = "dump_tweens";
    this.WEBGL_READY = "webgl_ready";
    this.HOMEPAGE = "homepage";
    this.RESIZE = "resize"
}, "Static");
Class(function ThreeUtils() {
    THREE.Object3D.prototype.lookAtCenter = function() {
        this.matrix.lookAt(this.position, new THREE.Vector3(0, 0, 0), this.up);
        this.quaternion.setFromRotationMatrix(this.matrix)
    };
    THREE.Object3D.prototype.applyState = function(a) {
        a = a.charAt ? JSON.parse(a) : a;
        if (typeof a !== "object") {
            a = JSON.parse(a)
        }
        var b = Global.ELEMENTS.scene;
        if (a.parent && a.parent.length) {
            var c = this;
            Render.nextFrame(function() {
                var d = b.getObjectByName(a.parent, true);
                d.add(c)
            })
        } else {
            b.add(this)
        }
        this.quaternion.set(a.quaternion.x, a.quaternion.y, a.quaternion.z, a.quaternion.w);
        this.position.copy(a.position)
    };
    THREE.Object3D.prototype.getState = function(a) {
        var b = JSON.stringify({
            parent: this.parent ? this.parent.name : null,
            position: {
                x: this.position.x,
                y: this.position.y,
                z: this.position.z
            },
            quaternion: {
                w: this.quaternion.w,
                x: this.quaternion.x,
                y: this.quaternion.y,
                z: this.quaternion.z
            }
        });
        console.log(b);
        return b
    };
    THREE.SplineCurve3.prototype.copyPoint = function(c, b) {
        var a = c * (this.points.length - 1);
        var d = Math.floor(a);
        b.copy(this.points[d], c);
        if (a != d && d != 0) {
            b.lerp(this.points[d + 1], a - d)
        }
    };
    THREE.ViewControls = function(H, I) {
        this.object = H;
        this.domElement = (I !== undefined) ? I : document;
        this.enabled = true;
        this.target = new THREE.Vector3();
        this.center = this.target;
        this.noZoom = true;
        this.zoomSpeed = 1;
        this.minDistance = 0;
        this.maxDistance = Infinity;
        this.noRotate = false;
        this.rotateSpeed = 1;
        this.noPan = true;
        this.keyPanSpeed = 7;
        this.autoRotate = false;
        this.autoRotateSpeed = 2;
        this.minPolarAngle = 0;
        this.maxPolarAngle = Math.PI;
        this.minTheta = -Math.PI / 2;
        this.maxTheta = Math.PI / 2;
        this.orbitFriction = 0.8;
        this.noKeys = false;
        this.keys = {
            LEFT: 37,
            UP: 38,
            RIGHT: 39,
            BOTTOM: 40,
            FORWARD: 81,
            BACK: 65,
            ROLL_LEFT: 90,
            ROLL_RIGHT: 88
        };
        var E = this;
        var d = 0.000001;
        var v = new THREE.Vector2(Stage.mouseX / 2, Stage.mouseY / 2);
        var r = new THREE.Vector2();
        var F = new THREE.Vector2();
        var e = new THREE.Vector2();
        var t = new THREE.Vector2();
        var n = new THREE.Vector2();
        var M = new THREE.Vector3();
        var G = new THREE.Vector3();
        var u = new THREE.Vector2();
        var b = new THREE.Vector2();
        var C = new THREE.Vector2();
        var q = initialTheta = 0;
        var T = initialPhi = Math.PI / 2;
        var J;
        var A = 0;
        var j = 0;
        var y = 1;
        var m = new THREE.Vector3();
        var v = new THREE.Vector3(Stage.mouseX / 2, Stage.mouseY / 2);
        var i = {
            NONE: -1,
            ROTATE: 0,
            DOLLY: 1,
            PAN: 2,
            TOUCH_ROTATE: 3,
            TOUCH_DOLLY: 4,
            TOUCH_PAN: 5
        };
        var U = i.NONE;
        this.limitRotation = true;
        this.STATE = i;
        this.target0 = this.target.clone();
        this.position0 = this.object.position.clone();
        var S = new THREE.Quaternion().setFromUnitVectors(H.up, new THREE.Vector3(0, 1, 0));
        var p = S.clone().inverse();
        var P = {
            type: "change"
        };
        var L = {
            type: "start"
        };
        var w = {
            type: "end"
        };
        var f = false;
        var l = false;
        this.reset = function() {
            this.resetBounds();
            U = i.NONE;
            T = initialPhi;
            q = initialTheta;
            B();
            v.set(Stage.width / 2, Stage.height / 2);
            U = i.ROTATE
        };
        this.resetBounds = function() {
            this.minPolarAngle = 0;
            this.maxPolarAngle = Math.PI;
            this.minTheta = -Math.PI * 0.5;
            this.maxTheta = Math.PI * 0.5
        };
        this.resetTween = function(X, Z, W) {
            this.resetBounds();
            var V = this.enabled;
            this.enabled = false;
            U = i.NONE;
            var Y = {
                phi: T,
                theta: q
            };
            TweenManager.tween(Y, {
                theta: initialTheta,
                phi: initialPhi
            }, X, Z, W, function() {
                T = Y.phi;
                q = Y.theta
            }, function() {
                v.set(Stage.width / 2, Stage.height / 2);
                this.enabled = true
            });
            U = i.ROTATE
        };
        var s;
        var c;
        var g;
        var D;
        var N;
        this.dragMode = function(V) {
            return;
            if (f == V) {
                return
            }
            f = V;
            if (V) {
                s = this.orbitFriction;
                this.orbitFriction = 0.1;
                c = this.minPolarAngle;
                g = this.maxPolarAngle;
                D = this.minTheta;
                N = this.maxTheta;
                this.reset()
            } else {
                this.orbitFriction = s;
                this.minPolarAngle = c;
                this.maxPolarAngle = g;
                this.minTheta = D;
                this.maxTheta = N
            }
        };
        this.rotateLeft = function(W) {
            if (W === undefined) {
                W = h()
            }
            var V = this.orbitFriction;
            if (f && l) {
                V = 1.5
            }
            j -= W * V
        };
        this.rotateUp = function(W) {
            if (W === undefined) {
                W = h()
            }
            var V = this.orbitFriction;
            if (f && l) {
                V = 1.5
            }
            A -= W * V
        };
        this.panLeft = function(W) {
            var V = this.object.matrix.elements;
            M.set(V[0], V[1], V[2]);
            M.multiplyScalar(-W);
            m.add(M)
        };
        this.panUp = function(W) {
            var V = this.object.matrix.elements;
            M.set(V[4], V[5], V[6]);
            M.multiplyScalar(W);
            m.add(M)
        };
        this.truck = function(W) {
            var V = this.object.matrix.elements;
            M.set(V[8], V[9], V[10]);
            M.multiplyScalar(-W * 500);
            m.add(M)
        };
        this.roll = function(Y) {
            var X = this.object.matrix.elements;
            var V = new THREE.Vector3(0, 1, 0);
            var W = new THREE.Vector3(X[2], X[6], X[10]);
            V.applyAxisAngle(W, Y);
            S = new THREE.Quaternion().setFromUnitVectors(H.up, V);
            p = S.clone().inverse();
            B()
        };
        this.pan = function(X, W) {
            var Y = E.domElement === document ? E.domElement.body : E.domElement;
            if (E.object.fov !== undefined) {
                var V = E.object.position;
                var aa = V.clone().sub(E.target);
                var Z = aa.length();
                Z *= Math.tan((E.object.fov / 2) * Math.PI / 180);
                E.panLeft(2 * X * Z / Y.clientHeight);
                E.panUp(2 * W * Z / Y.clientHeight)
            } else {
                if (E.object.top !== undefined) {
                    E.panLeft(X * (E.object.right - E.object.left) / Y.clientWidth);
                    E.panUp(W * (E.object.top - E.object.bottom) / Y.clientHeight)
                } else {
                    console.warn("WARNING: ViewControls.js encountered an unknown camera type - pan disabled.")
                }
            }
        };
        this.dollyIn = function(V) {
            if (V === undefined) {
                V = x()
            }
            y /= V
        };
        this.dollyOut = function(V) {
            if (V === undefined) {
                V = x()
            }
            y *= V
        };
        this.update = function() {};
        this.loop = function(W, X) {
            var V = this.object.position;
            G.copy(V).sub(this.target);
            G.applyQuaternion(S);
            if (U == i.ROTATE) {
                thetaTarget = Math.atan2(G.x, G.z);
                if (this.limitRotation) {
                    thetaTarget = Math.min(Math.max(thetaTarget, this.minTheta), this.maxTheta)
                }
                phiTarget = Math.atan2(Math.sqrt(G.x * G.x + G.z * G.z), G.y)
            } else {
                thetaTarget = initialTheta;
                phiTarget = initialPhi
            } if (this.autoRotate) {
                this.rotateLeft(h())
            }
            thetaTarget += j / 2;
            phiTarget += A / 2;
            if (this.limitRotation) {
                phiTarget = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, phiTarget))
            }
            phiTarget = Math.max(d, Math.min(Math.PI - d, phiTarget));
            J = G.length() * y;
            J = Math.max(this.minDistance, Math.min(this.maxDistance, J));
            this.target.add(m);
            var Y = 0.02;
            T += (phiTarget - T) * Y;
            q += (thetaTarget - q) * Y;
            B()
        };

        function B() {
            G.x = J * Math.sin(T) * Math.sin(q);
            G.y = J * Math.cos(T);
            G.z = J * Math.sin(T) * Math.cos(q);
            G.applyQuaternion(p);
            E.object.position.copy(E.target).add(G);
            E.object.lookAt(E.target);
            j *= 0.95;
            A *= 0.95;
            y = 1;
            m.set(0, 0, 0)
        }

        function h() {
            return 2 * Math.PI / 60 / 60 * E.autoRotateSpeed
        }

        function x() {
            return Math.pow(0.95, E.zoomSpeed)
        }

        function O(V) {
            l = true;
            if (E.enabled === false) {
                return
            }
            if (E.noRotate === true) {
                return
            }
            U = i.ROTATE;
            v.set(Mouse.x, Mouse.y);
            E.domElement.addEventListener("mousemove", a, false);
            E.domElement.addEventListener("mouseup", R, false);
            E.dispatchEvent(L)
        }

        function a(W) {
            if (W.clientX < 0 || W.clientX > window.innerWidth) {
                return
            }
            if (W.clientY < 0 || W.clientY > window.innerHeight) {
                return
            }
            if (E.enabled === false) {
                return
            }
            var V = E.domElement === document ? E.domElement.body : E.domElement;
            if (U === i.ROTATE) {
                if (E.noRotate === true) {
                    return
                }
                if (Mouse.y > Stage.height - Config.TIMELINE_HEIGHT) {
                    return
                }
                r.set(Mouse.x, Mouse.y);
                F.subVectors(r, v);
                E.rotateLeft(2 * Math.PI * F.x / V.clientWidth * E.rotateSpeed);
                E.rotateUp(2 * Math.PI * F.y / V.clientHeight * E.rotateSpeed);
                v.copy(r)
            } else {
                if (U === i.DOLLY) {
                    if (E.noZoom === true) {
                        return
                    }
                    b.set(Mouse.x, Mouse.y);
                    C.subVectors(b, u);
                    if (C.y > 0) {
                        E.dollyIn()
                    } else {
                        E.dollyOut()
                    }
                    u.copy(b)
                } else {
                    if (U === i.PAN) {
                        if (E.noPan === true) {
                            return
                        }
                        t.set(Mouse.x, Mouse.y);
                        n.subVectors(t, e);
                        E.pan(n.x, n.y);
                        e.copy(t)
                    }
                }
            }
            E.update()
        }

        function R() {
            l = false;
            if (E.enabled === false) {
                return
            }
            E.domElement.removeEventListener("mouseup", R, false);
            E.dispatchEvent(w)
        }

        function K(V) {
            if (E.enabled === false || E.noZoom === true) {
                return
            }
            V.stopPropagation();
            var W = 0;
            if (V.wheelDelta !== undefined) {
                W = V.wheelDelta
            } else {
                if (V.detail !== undefined) {
                    W = -V.detail
                }
            } if (W > 0) {
                E.dollyOut()
            } else {
                E.dollyIn()
            }
            E.update();
            E.dispatchEvent(L);
            E.dispatchEvent(w)
        }

        function k(V) {
            return;
            if (E.enabled === false || E.noKeys === true || E.noPan === true) {
                return
            }
            switch (V.keyCode) {
                case E.keys.UP:
                    E.pan(0, E.keyPanSpeed);
                    E.update();
                    break;
                case E.keys.BOTTOM:
                    E.pan(0, -E.keyPanSpeed);
                    E.update();
                    break;
                case E.keys.LEFT:
                    E.pan(E.keyPanSpeed, 0);
                    E.update();
                    break;
                case E.keys.RIGHT:
                    E.pan(-E.keyPanSpeed, 0);
                    E.update();
                    break;
                case E.keys.FORWARD:
                    E.truck(E.keyPanSpeed);
                    E.update();
                    break;
                case E.keys.BACK:
                    E.truck(-E.keyPanSpeed);
                    E.update();
                    break;
                case E.keys.ROLL_LEFT:
                    E.roll(-0.02);
                    E.update();
                    break;
                case E.keys.ROLL_RIGHT:
                    E.roll(0.02);
                    E.update()
            }
        }

        function Q(V) {
            l = true;
            if (E.enabled === false) {
                return
            }
            switch (V.touches.length) {
                case 1:
                    if (E.noRotate === true) {
                        return
                    }
                    if (Mouse.y > Stage.height - Config.TIMELINE_HEIGHT) {
                        return
                    }
                    U = i.TOUCH_ROTATE;
                    v.set(Mouse.x, Mouse.y);
                    break;
                default:
            }
            E.dispatchEvent(L)
        }

        function o(W) {
            if (E.enabled === false) {
                return
            }
            var V = E.domElement === document ? E.domElement.body : E.domElement;
            switch (W.touches.length) {
                case 1:
                    if (E.noRotate === true) {
                        return
                    }
                    if (U !== i.TOUCH_ROTATE) {
                        return
                    }
                    var X = Utils.touchEvent(W);
                    r.set(X.x, X.y);
                    F.subVectors(r, v);
                    E.rotateLeft(2 * Math.PI * F.x / V.clientWidth * E.rotateSpeed);
                    E.rotateUp(2 * Math.PI * F.y / V.clientHeight * E.rotateSpeed);
                    v.copy(r);
                    E.update();
                    break;
                default:
                    U = i.NONE
            }
        }

        function z() {
            if (E.enabled === false) {
                return
            }
            E.dispatchEvent(w);
            O()
        }
        E.domElement.addEventListener("mousemove", a, false);
        U = i.ROTATE;
        this.domElement.addEventListener("mousedown", O, false);
        if (ContactDevice.CHROME_OS) {
            this.domElement.addEventListener("touchstart", Q, false);
            this.domElement.addEventListener("touchend", z, false);
            this.domElement.addEventListener("touchmove", o, false)
        }
        window.addEventListener("keydown", k, false);
        this.update()
    };
    THREE.ViewControls.prototype = Object.create(THREE.EventDispatcher.prototype)
}, "Singleton");
Class(function TextureMaterial(a) {
    Inherit(this, Component);
    var c = this;
    this.material = null;
    (function() {
        b()
    })();

    function b() {
        if (typeof a === "string") {
            a = THREE.ImageUtils.loadTexture(a)
        }
        var d = {
            map: {
                type: "t",
                value: a
            },
            opacity: {
                type: "f",
                value: 1
            }
        };
        c.material = new THREE.ShaderMaterial({
            vertexShader: Hydra.SHADERS["BasicVertex.vs"],
            fragmentShader: Hydra.SHADERS["TextureShader.fs"],
            uniforms: d
        })
    }
    this.set("opacity", function(d) {
        c.material.uniforms.opacity.value = d
    });
    this.get("opacity", function() {
        return c.material.uniforms.opacity.value
    })
});
Class(function ScrollUtil() {
    var s = this;
    var x;
    var l = [];
    var w = {
        y: 0,
        save: 0
    };
    var n = false;
    var p;
    var g;
    var d;
    var f;
    var o = new Vector2();
    var m = new Vector2();
    var w = new Vector2();
    var h = new Vector2();
    var b = new Vector2();
    var i = new Vector2();
    var a = new Vector2();
    Global.SCROLL_LERP = Device.mobile ? 0.25 : 0.1;
    (function() {
        v();
        Hydra.ready(q)
    })();

    function v() {
        if (Device.browser.ie) {
            return x = 2
        }
        if (Device.system.os == "mac") {
            if ((Device.browser.chrome) || Device.browser.safari) {
                x = 40
            } else {
                x = 1
            }
            return
        } else {
            if (Device.browser.chrome) {
                x = 15
            } else {
                x = 0.5
            }
        }
    }

    function q() {
        if (!Device.mobile) {
            if (Device.browser.ie) {
                window.onmousewheel = c
            } else {
                __window.bind("DOMMouseScroll", c);
                __window.bind("mousewheel", c)
            } if (!Device.browser.firefox) {
                __window.keydown(r)
            }
        } else {
            Stage.bind("touchstart", e);
            Stage.bind("touchend", j);
            Stage.bind("touchcancel", j)
        } if (ContactDevice.CHROME_OS) {
            window.addEventListener("touchstart", z);
            window.addEventListener("touchend", u);
            window.addEventListener("touchcancel", u)
        }
    }

    function r(A) {
        if (A.keyCode == 40) {
            k(250)
        }
        if (A.keyCode == 38) {
            k(-250)
        }
    }

    function c(B) {
        if (f) {
            return
        }
        if (!p && !g) {
            g = B.timeStamp
        } else {
            if (!p) {
                if (B.timeStamp - g < 20) {
                    d = true
                }
                p = true
            }
        } if (d) {
            g = B.timeStamp
        }
        var A = B.wheelDelta || -B.detail;
        var C = Math.ceil(-A / x);
        if (B.preventDefault) {
            B.preventDefault()
        }
        if (C <= 0) {
            C -= 1
        }
        if (A == 3 || A == 6) {
            Global.SCROLL_LERP = Mobile.phone ? 0.05 : 0.8
        }
        k(C * 3)
    }

    function e(A) {
        Stage.bind("touchmove", t);
        i.copyFrom(o);
        w.copyFrom(A)
    }

    function t(A) {
        h.subVectors(A, w);
        m.y = i.y + h.y;
        o.y = m.y;
        if (b.y) {
            a.subVectors(A, b);
            a.time = Date.now()
        }
        if (Mobile.phone) {
            a.y *= 2
        }
        k(a.y * -1);
        b.subVectors(A, b);
        b.copyFrom(A)
    }

    function j(A) {
        Stage.unbind("touchmove", t);
        if (a.y) {
            a.divide((Date.now() - a.time) || 1);
            m.y += a.y * 20
        }
        h.clear();
        w.clear();
        b.clear();
        a.clear()
    }

    function z(A) {
        window.addEventListener("touchmove", y);
        i.copyFrom(o);
        w.copyFrom(A)
    }

    function y(A) {
        A = {
            x: A.touches[0].pageX,
            y: A.touches[0].pageY
        };
        h.subVectors(A, w);
        m.y = i.y + h.y;
        o.y = m.y;
        if (b.y) {
            a.subVectors(A, b);
            a.time = Date.now()
        }
        if (Mobile.phone) {
            a.y *= 2
        }
        k(a.y * -1);
        b.subVectors(A, b);
        b.copyFrom(A)
    }

    function u(A) {
        window.removeEventListener("touchmove", y);
        if (a.y) {
            a.divide((Date.now() - a.time) || 1);
            if (Math.abs(a.y) > 20) {
                a.multiply(0.1)
            }
            if (Mobile.os != "Android") {
                m.y += a.y * 100
            }
        }
        h.clear();
        w.clear();
        b.clear();
        a.clear()
    }

    function k(B) {
        for (var A = 0; A < l.length; A++) {
            l[A](B)
        }
    }
    this.reset = function() {
        this.value = 0
    };
    this.link = function(A) {
        if (f) {
            f = false
        }
        l.push(A)
    };
    this.unlink = function(B) {
        var A = l.indexOf(B);
        if (A > -1) {
            l.splice(A, 1)
        }
    };
    this.off = function() {
        f = true
    }
}, "Static");
Class(function ContactUtil() {
    var d = this;
    var b = [];
    (function() {
        window.console.error = window.console.error || window.console.log;
        a();
        if (window.location.search.strpos("enzyme")) {
            c()
        }
    })();

    function a() {
        TweenManager.addCustomEase({
            name: "timelineBounce",
            curve: "cubic-bezier(.46,.37,.12,1.4)"
        });
        TweenManager.addCustomEase({
            name: "overviewTransition",
            curve: "cubic-bezier(.39,.04,0,.98)"
        });
        TweenManager.addCustomEase({
            name: "trailDraw",
            curve: "cubic-bezier(.41,0,0,.48)"
        });
        TweenManager.addCustomEase({
            name: "cameraZoomIn",
            curve: "cubic-bezier(.61,.18,.06,1)"
        })
    }
    this.initGoogleShare = function() {
        var e = Config.SHARE("google");
        gapi.interactivepost.render("G-Plus-Share", e)
    };

    function c() {
        window.onerror = function(g, f, e) {
            alert("ERROR: " + g + " ::: " + f + " : " + e)
        }
    }
    this.observe = function(e) {
        Object.observe(e.position, function(f) {
            console.log(f)
        });
        Object.observe(e.scale, function(f) {
            console.log(f)
        });
        if (e.material) {
            Object.observe(e.material["visible"], function(f) {
                console.log(f)
            })
        }
    };
    this.popup = function(h) {
        var e = 400;
        if (h == "facebook") {
            if (window.FB) {
                FB.ui(Config.SHARE(h), function() {})
            }
        } else {
            if (h == "google") {
                var g = document.getElementById("G-Plus-Share");
                g.click()
            } else {
                var f = Config.SHARE(h);
                if (f) {
                    var i = window.open(f, "share", "height=" + e + ",width=500,scrollbars=yes");
                    if (window.focus) {
                        i.focus()
                    }
                }
            }
        }
    };
    this.bundleAssets = function(n, l) {
        l = l || [];
        if (typeof n.splice === "undefined") {
            n = [n]
        }
        for (var h = 0; h < n.length; h++) {
            for (var g = 0; g < Config.ASSETS.length; g++) {
                var m = Config.ASSETS[g];
                if (m.strpos(n[h])) {
                    var f = false;
                    for (var e = 0; e < b.length; e++) {
                        if (b[e].strpos(m)) {
                            f = true
                        }
                    }
                    if (!f) {
                        l.push(Config.CDN + m);
                        b.push(m)
                    }
                }
            }
        }
        return l
    };
    this.checkResize = function() {};
    this.clearTweens = function(j) {
        for (var g = 0; g < j.length; g++) {
            var h = j[g];
            TweenManager.clearTween(h);
            var e = h.uniforms;
            if (e) {
                for (var f in e) {
                    TweenManager.clearTween(e[f])
                }
            }
            if (h.position) {
                TweenManager.clearTween(h.position)
            }
            if (h.rotation) {
                TweenManager.clearTween(h.rotation)
            }
            if (h.scale) {
                TweenManager.clearTween(h.scale)
            }
        }
    }
}, "Static");
Class(function ContactDevice() {
    Inherit(this, Events);
    var g = this;
    var c;
    this.pixelRatio = window.devicePixelRatio || 1;
    this.CHROME_OS = Device.agent.strpos("cros");
    this.KILL_RETINA = (function() {
        if (g.CHROME_OS) {
            g.pixelRatio = 1;
            return true
        }
        return false
    })();
    this.PREVENT_3D = false;
    this.WEBGL = (function() {
        if (Device.mobile) {
            return false
        }
        if (Device.browser.ie) {
            return false
        }
        if (Device.browser.safari && Device.browser.version < 8) {
            return false
        }
        return Device.graphics.webgl
    })();
    this.NO_WEBGL = !this.WEBGL;
    this.IPHONE = Mobile.phone && Mobile.os == "iOS";
    if (!this.WEBGL) {
        Config.TITLES = false
    }(function() {
        Hydra.ready(f)
    })();

    function f() {
        g.events.subscribe(HydraEvents.RESIZE, b);
        b(null, true);
        if (Device.mobile) {
            __window.bind("touchstart", e)
        }
    }

    function b(h, i) {
        __body.div.scrollTop = Stage.div.scrollTop = __window.div.scrollTop = 0;
        Stage.size(Stage.width, Stage.height);
        if (Device.mobile) {
            if (!i) {
                d()
            }
            if (Stage.width > Stage.height) {
                a()
            }
        } else {
            a()
        }
    }

    function a() {
        if (c) {
            clearTimeout(c)
        }
        c = setTimeout(function() {
            g.events.fire(ContactEvents.RESIZE)
        }, 200)
    }

    function e() {
        var h = Device.getFullscreen();
        if (!h) {
            Device.openFullscreen()
        }
    }

    function d() {
        if (Stage.width < Stage.height) {
            g.events.fire(ContactEvents.PAUSE);
            DeviceError.instance().show("rotate", function() {
                a();
                if (Mobile.os !== "iOS" || !Mobile.phone) {
                    g.events.fire(ContactEvents.RESUME)
                }
            })
        } else {
            DeviceError.instance().hide()
        }
    }
}, "Static");
Class(function AboutModel(a, e) {
    Inherit(this, Model);
    var d = this;
    var c;
    (function() {
        b()
    })();

    function b() {
        c = a;
        c.tech = e;
        var g = [{
            array: c.sources_left
        }, {
            array: c.sources_right
        }];
        c.sources = {};
        for (var f = 0; f < g.length; f++) {
            c.sources[f] = g[f].array.replace(/\n/g, "<br/>")
        }
    }
    this.getCopy = function() {
        return c
    }
});
Class(function ShotsModel(b) {
    Inherit(this, Model);
    var g = this;
    var j;
    var m = new LinkedList();
    var l = [];
    (function() {
        Global.SHOT = {};
        h();
        i();
        Data.VIDEO.tick(a)
    })();

    function h() {
        for (var q = 0; q < b.length; q++) {
            var o = b[q];
            if (o.time && o.time.length && o.className && o.className.length) {
                var p = {};
                p.inTime = parseFloat(o.time);
                p.outTime = p.inTime + parseFloat(o.duration);
                p.activated = false;
                p.className = o.className;
                p.perma = o.perma;
                p.duration = parseFloat(o.duration);
                p.camera1 = o.camera1;
                p.camera2 = o.camera2;
                p.camera3 = o.camera3;
                p.camera4 = o.camera4;
                p.camera5 = o.camera5;
                m.push(p)
            }
        }
    }

    function k(p) {
        for (var o in b) {
            if (b[o].className == p) {
                return b[o]
            }
        }
    }

    function e(o) {
        j = new window[o.className](o);
        j._data = o;
        l.push(j);
        DummyShotMoment.copy(j);
        Global.SHOT[o.className] = j;
        if (Global.PREVIEW) {
            Global.CURRENT_SHOT = j
        }
    }

    function c(o) {
        Render.nextFrame(function() {
            e(o)
        })
    }

    function i() {
        g.events.subscribe(ContactEvents.PAUSE, n);
        g.events.subscribe(ContactEvents.RESUME, d);
        g.events.subscribe(ContactEvents.RESET_3D, f)
    }

    function d() {
        for (var o = 0; o < l.length; o++) {
            if (l[o].resume) {
                l[o].resume()
            }
        }
    }

    function n() {
        for (var o = 0; o < l.length; o++) {
            if (l[o].pause) {
                l[o].pause()
            }
        }
    }

    function f(q) {
        for (var o = 0; o < l.length; o++) {
            if (l[o].destroy) {
                if (l[o].stopTweens) {
                    l[o].stopTweens()
                }
                l[o].destroy()
            }
            g.remove(l[o])
        }
        var p = m.start();
        while (p) {
            p.activated = false;
            p = m.next()
        }
        if (q) {
            g.initFrom(q.time)
        }
    }

    function a(p) {
        var o = m.start();
        while (o) {
            if (p && p.time > o.inTime && p.time < o.inTime + 1) {
                if (!o.activated) {
                    o.activated = true;
                    c(o)
                }
            }
            o = m.next()
        }
    }
    this.initShot = function(p, q) {
        if (!Global.PREVIEW && !q) {
            return
        }
        var o = k(p);
        if (!o) {
            throw "No Shot Found :: " + p
        }
        e(o)
    };
    this.initOverview = function() {
        var o = k("OverviewShot");
        e(o)
    };
    this.remove = function(p) {
        if (!p || !p._data) {
            return
        }
        if (p.stopTweens) {
            p.stopTweens()
        }
        Global.SHOT[p._data.className] = DummyShotMoment;
        var o = l.indexOf(p);
        if (o > -1) {
            l.splice(o, 1)
        }
        p.destroy()
    };
    this.initFrom = function(p) {
        var o = m.start();
        while (o) {
            if (p > o.inTime) {
                o.activated = true
            }
            o = m.next()
        }
    };
    this.clear = function() {
        f()
    }
});
/*!
 *  howler.js v1.1.17
 *  howlerjs.com
 *
 *  (c) 2013-2014, James Simpson of GoldFire Studios
 *  goldfirestudios.com
 *
 *  MIT License
 */
(function() {
    var a = {};
    var o = null,
        c = true,
        k = false;
    if (typeof AudioContext !== "undefined") {
        o = new AudioContext()
    } else {
        if (typeof webkitAudioContext !== "undefined") {
            o = new webkitAudioContext()
        } else {
            if (typeof Audio !== "undefined") {
                c = false;
                try {
                    new Audio()
                } catch (h) {
                    k = true
                }
            } else {
                c = false;
                k = true
            }
        }
    } if (c) {
        var g = (typeof o.createGain === "undefined") ? o.createGainNode() : o.createGain();
        g.gain.value = 1;
        g.connect(o.destination)
    }
    var d = function() {
        this._volume = 1;
        this._muted = false;
        this.usingWebAudio = c;
        this.noAudio = k;
        this._howls = []
    };
    d.prototype = {
        volume: function(r) {
            var e = this;
            r = parseFloat(r);
            if (r >= 0 && r <= 1) {
                e._volume = r;
                if (c) {
                    g.gain.value = r
                }
                for (var q in e._howls) {
                    if (e._howls.hasOwnProperty(q) && e._howls[q]._webAudio === false) {
                        for (var p = 0; p < e._howls[q]._audioNode.length; p++) {
                            e._howls[q]._audioNode[p].volume = e._howls[q]._volume * e._volume
                        }
                    }
                }
                return e
            }
            return (c) ? g.gain.value : e._volume
        },
        mute: function() {
            this._setMuted(true);
            return this
        },
        unmute: function() {
            this._setMuted(false);
            return this
        },
        _setMuted: function(r) {
            var e = this;
            e._muted = r;
            if (c) {
                g.gain.value = r ? 0 : e._volume
            }
            for (var q in e._howls) {
                if (e._howls.hasOwnProperty(q) && e._howls[q]._webAudio === false) {
                    for (var p = 0; p < e._howls[q]._audioNode.length; p++) {
                        e._howls[q]._audioNode[p].muted = r
                    }
                }
            }
        }
    };
    var n = new d();
    var m = null;
    if (!k) {
        m = new Audio();
        var b = {
            mp3: !! m.canPlayType("audio/mpeg;").replace(/^no$/, ""),
            opus: !! m.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/, ""),
            ogg: !! m.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ""),
            wav: !! m.canPlayType('audio/wav; codecs="1"').replace(/^no$/, ""),
            m4a: !! (m.canPlayType("audio/x-m4a;") || m.canPlayType("audio/aac;")).replace(/^no$/, ""),
            mp4: !! (m.canPlayType("audio/x-mp4;") || m.canPlayType("audio/aac;")).replace(/^no$/, ""),
            weba: !! m.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, "")
        }
    }
    var f = function(p) {
        var e = this;
        e._autoplay = p.autoplay || false;
        e._buffer = p.buffer || false;
        e._duration = p.duration || 0;
        e._format = p.format || null;
        e._loop = p.loop || false;
        e._loaded = false;
        e._sprite = p.sprite || {};
        e._src = p.src || "";
        e._pos3d = p.pos3d || [0, 0, -0.5];
        e._volume = p.volume !== undefined ? p.volume : 1;
        e._urls = p.urls || [];
        e._rate = p.rate || 1;
        e._onload = [p.onload || function() {}];
        e._onloaderror = [p.onloaderror || function() {}];
        e._onend = [p.onend || function() {}];
        e._onpause = [p.onpause || function() {}];
        e._onplay = [p.onplay || function() {}];
        e._onendTimer = [];
        e._webAudio = c && !e._buffer;
        e._audioNode = [];
        if (e._webAudio) {
            e._setupAudioNode()
        }
        n._howls.push(e);
        e.load()
    };
    f.prototype = {
        load: function() {
            var p = this,
                q = null;
            if (k) {
                p.on("loaderror");
                return
            }
            for (var s = 0; s < p._urls.length; s++) {
                var t, e;
                if (p._format) {
                    t = p._format
                } else {
                    e = p._urls[s].toLowerCase().split("?")[0];
                    t = e.match(/.+\.([^?]+)(\?|$)/);
                    t = (t && t.length >= 2) ? t : e.match(/data\:audio\/([^?]+);/);
                    if (t) {
                        t = t[1]
                    } else {
                        p.on("loaderror");
                        return
                    }
                } if (b[t]) {
                    q = p._urls[s];
                    break
                }
            }
            if (!q) {
                p.on("loaderror");
                return
            }
            p._src = q;
            if (p._webAudio) {
                j(p, q)
            } else {
                var r = new Audio();
                p._audioNode.push(r);
                r.src = q;
                r._pos = 0;
                r.preload = "auto";
                r.volume = (n._muted) ? 0 : p._volume * n.volume();
                a[q] = p;
                var u = function() {
                    p._duration = Math.ceil(r.duration * 10) / 10;
                    if (Object.getOwnPropertyNames(p._sprite).length === 0) {
                        p._sprite = {
                            _default: [0, p._duration * 1000]
                        }
                    }
                    if (!p._loaded) {
                        p._loaded = true;
                        p.on("load")
                    }
                    if (p._autoplay) {
                        p.play()
                    }
                    r.removeEventListener("canplaythrough", u, false)
                };
                r.addEventListener("canplaythrough", u, false);
                r.load()
            }
            return p
        },
        urls: function(p) {
            var e = this;
            if (p) {
                e.stop();
                e._urls = (typeof p === "string") ? [p] : p;
                e._loaded = false;
                e.load();
                return e
            } else {
                return e._urls
            }
        },
        play: function(p, q) {
            var e = this;
            if (typeof p === "function") {
                q = p
            }
            if (!p || typeof p === "function") {
                p = "_default"
            }
            if (!e._loaded) {
                e.on("load", function() {
                    e.play(p, q)
                });
                return e
            }
            if (!e._sprite[p]) {
                if (typeof q === "function") {
                    q()
                }
                return e
            }
            e._inactiveNode(function(v) {
                v._sprite = p;
                var y = (v._pos > 0) ? v._pos : e._sprite[p][0] / 1000,
                    x = e._sprite[p][1] / 1000 - v._pos;
                var s = !! (e._loop || e._sprite[p][2]);
                var t = (typeof q === "string") ? q : Math.round(Date.now() * Math.random()) + "",
                    r;
                (function() {
                    var z = {
                        id: t,
                        sprite: p,
                        loop: s
                    };
                    r = setTimeout(function() {
                        if (!e._webAudio && s) {
                            e.stop(z.id, z.timer).play(p, z.id)
                        }
                        if (e._webAudio && !s) {
                            e._nodeById(z.id).paused = true;
                            e._nodeById(z.id)._pos = 0
                        }
                        if (!e._webAudio && !s) {
                            e.stop(z.id, z.timer)
                        }
                        e.on("end", t)
                    }, x * 1000);
                    e._onendTimer.push(r);
                    z.timer = e._onendTimer[e._onendTimer.length - 1]
                })();
                if (e._webAudio) {
                    var u = e._sprite[p][0] / 1000,
                        w = e._sprite[p][1] / 1000;
                    v.id = t;
                    v.paused = false;
                    l(e, [s, u, w], t);
                    e._playStart = o.currentTime;
                    v.gain.value = e._volume;
                    if (typeof v.bufferSource.start === "undefined") {
                        v.bufferSource.noteGrainOn(0, y, x)
                    } else {
                        v.bufferSource.start(0, y, x)
                    }
                } else {
                    if (v.readyState === 4) {
                        v.id = t;
                        v.currentTime = y;
                        v.muted = n._muted;
                        v.volume = e._volume * n.volume();
                        setTimeout(function() {
                            v.play()
                        }, 0)
                    } else {
                        e._clearEndTimer(r);
                        (function() {
                            var D = e,
                                B = p,
                                A = q,
                                z = v;
                            var C = function() {
                                D.play(B, A);
                                z.removeEventListener("canplaythrough", C, false)
                            };
                            z.addEventListener("canplaythrough", C, false)
                        })();
                        return e
                    }
                }
                e.on("play");
                if (typeof q === "function") {
                    q(t)
                }
                return e
            });
            return e
        },
        pause: function(r, e) {
            var p = this;
            if (!p._loaded) {
                p.on("play", function() {
                    p.pause(r)
                });
                return p
            }
            p._clearEndTimer(e || 0);
            var q = (r) ? p._nodeById(r) : p._activeNode();
            if (q) {
                q._pos = p.pos(null, r);
                if (p._webAudio) {
                    if (!q.bufferSource || q.paused) {
                        return p
                    }
                    q.paused = true;
                    if (typeof q.bufferSource.stop === "undefined") {
                        q.bufferSource.noteOff(0)
                    } else {
                        q.bufferSource.stop(0)
                    }
                } else {
                    q.pause()
                }
            }
            p.on("pause");
            return p
        },
        stop: function(r, e) {
            var p = this;
            if (!p._loaded) {
                p.on("play", function() {
                    p.stop(r)
                });
                return p
            }
            p._clearEndTimer(e || 0);
            var q = (r) ? p._nodeById(r) : p._activeNode();
            if (q) {
                q._pos = 0;
                if (p._webAudio) {
                    if (!q.bufferSource || q.paused) {
                        return p
                    }
                    q.paused = true;
                    if (typeof q.bufferSource.stop === "undefined") {
                        q.bufferSource.noteOff(0)
                    } else {
                        q.bufferSource.stop(0)
                    }
                } else {
                    q.pause();
                    q.currentTime = 0
                }
            }
            return p
        },
        mute: function(q) {
            var e = this;
            if (!e._loaded) {
                e.on("play", function() {
                    e.mute(q)
                });
                return e
            }
            var p = (q) ? e._nodeById(q) : e._activeNode();
            if (p) {
                if (e._webAudio) {
                    p.gain.value = 0
                } else {
                    p.volume = 0
                }
            }
            return e
        },
        unmute: function(q) {
            var e = this;
            if (!e._loaded) {
                e.on("play", function() {
                    e.unmute(q)
                });
                return e
            }
            var p = (q) ? e._nodeById(q) : e._activeNode();
            if (p) {
                if (e._webAudio) {
                    p.gain.value = e._volume
                } else {
                    p.volume = e._volume
                }
            }
            return e
        },
        volume: function(p, r) {
            var e = this;
            p = parseFloat(p);
            if (p >= 0 && p <= 1) {
                e._volume = p;
                if (!e._loaded) {
                    e.on("play", function() {
                        e.volume(p, r)
                    });
                    return e
                }
                var q = (r) ? e._nodeById(r) : e._activeNode();
                if (q) {
                    if (e._webAudio) {
                        q.gain.value = p
                    } else {
                        q.volume = p * n.volume()
                    }
                }
                return e
            } else {
                return e._volume
            }
        },
        loop: function(e) {
            var p = this;
            if (typeof e === "boolean") {
                p._loop = e;
                return p
            } else {
                return p._loop
            }
        },
        sprite: function(p) {
            var e = this;
            if (typeof p === "object") {
                e._sprite = p;
                return e
            } else {
                return e._sprite
            }
        },
        pos: function(s, r) {
            var e = this;
            if (!e._loaded) {
                e.on("load", function() {
                    e.pos(s)
                });
                return typeof s === "number" ? e : e._pos || 0
            }
            s = parseFloat(s);
            var q = (r) ? e._nodeById(r) : e._activeNode();
            if (q) {
                if (s >= 0) {
                    e.pause(r);
                    q._pos = s;
                    e.play(q._sprite, r);
                    return e
                } else {
                    return e._webAudio ? q._pos + (o.currentTime - e._playStart) : q.currentTime
                }
            } else {
                if (s >= 0) {
                    return e
                } else {
                    for (var p = 0; p < e._audioNode.length; p++) {
                        if (e._audioNode[p].paused && e._audioNode[p].readyState === 4) {
                            return (e._webAudio) ? e._audioNode[p]._pos : e._audioNode[p].currentTime
                        }
                    }
                }
            }
        },
        pos3d: function(e, t, r, s) {
            var p = this;
            t = (typeof t === "undefined" || !t) ? 0 : t;
            r = (typeof r === "undefined" || !r) ? -0.5 : r;
            if (!p._loaded) {
                p.on("play", function() {
                    p.pos3d(e, t, r, s)
                });
                return p
            }
            if (e >= 0 || e < 0) {
                if (p._webAudio) {
                    var q = (s) ? p._nodeById(s) : p._activeNode();
                    if (q) {
                        p._pos3d = [e, t, r];
                        q.panner.setPosition(e, t, r)
                    }
                }
            } else {
                return p._pos3d
            }
            return p
        },
        fade: function(u, v, s, x, p) {
            var y = this,
                w = Math.abs(u - v),
                q = u > v ? "down" : "up",
                t = w / 0.01,
                e = s / t;
            if (!y._loaded) {
                y.on("load", function() {
                    y.fade(u, v, s, x, p)
                });
                return y
            }
            y.volume(u, p);
            for (var r = 1; r <= t; r++) {
                (function() {
                    var B = y._volume + (q === "up" ? 0.01 : -0.01) * r,
                        A = Math.round(1000 * B) / 1000,
                        z = v;
                    setTimeout(function() {
                        y.volume(A, p);
                        if (A === z) {
                            if (x) {
                                x()
                            }
                        }
                    }, e * r)
                })()
            }
        },
        fadeIn: function(q, e, p) {
            return this.volume(0).play().fade(0, q, e, p)
        },
        fadeOut: function(s, e, r, q) {
            var p = this;
            return p.fade(p._volume, s, e, function() {
                if (r) {
                    r()
                }
                p.pause(q);
                p.on("end")
            }, q)
        },
        _nodeById: function(r) {
            var e = this,
                q = e._audioNode[0];
            for (var p = 0; p < e._audioNode.length; p++) {
                if (e._audioNode[p].id === r) {
                    q = e._audioNode[p];
                    break
                }
            }
            return q
        },
        _activeNode: function() {
            var e = this,
                q = null;
            for (var p = 0; p < e._audioNode.length; p++) {
                if (!e._audioNode[p].paused) {
                    q = e._audioNode[p];
                    break
                }
            }
            e._drainPool();
            return q
        },
        _inactiveNode: function(s) {
            var e = this,
                r = null;
            for (var q = 0; q < e._audioNode.length; q++) {
                if (e._audioNode[q].paused && e._audioNode[q].readyState === 4) {
                    s(e._audioNode[q]);
                    r = true;
                    break
                }
            }
            e._drainPool();
            if (r) {
                return
            }
            var p;
            if (e._webAudio) {
                p = e._setupAudioNode();
                s(p)
            } else {
                e.load();
                p = e._audioNode[e._audioNode.length - 1];
                p.addEventListener("loadedmetadata", function() {
                    s(p)
                })
            }
        },
        _drainPool: function() {
            var e = this,
                q = 0,
                p;
            for (p = 0; p < e._audioNode.length; p++) {
                if (e._audioNode[p].paused) {
                    q++
                }
            }
            for (p = e._audioNode.length - 1; p >= 0; p--) {
                if (q <= 5) {
                    break
                }
                if (e._audioNode[p].paused) {
                    if (e._webAudio) {
                        e._audioNode[p].disconnect(0)
                    }
                    q--;
                    e._audioNode.splice(p, 1)
                }
            }
        },
        _clearEndTimer: function(e) {
            var p = this,
                q = p._onendTimer.indexOf(e);
            q = q >= 0 ? q : 0;
            if (p._onendTimer[q]) {
                clearTimeout(p._onendTimer[q]);
                p._onendTimer.splice(q, 1)
            }
        },
        _setupAudioNode: function() {
            var e = this,
                q = e._audioNode,
                p = e._audioNode.length;
            q[p] = (typeof o.createGain === "undefined") ? o.createGainNode() : o.createGain();
            q[p].gain.value = e._volume;
            q[p].paused = true;
            q[p]._pos = 0;
            q[p].readyState = 4;
            q[p].connect(g);
            q[p].panner = o.createPanner();
            q[p].panner.setPosition(e._pos3d[0], e._pos3d[1], e._pos3d[2]);
            q[p].panner.connect(q[p]);
            return q[p]
        },
        on: function(s, r) {
            var e = this,
                q = e["_on" + s];
            if (typeof r === "function") {
                q.push(r)
            } else {
                for (var p = 0; p < q.length; p++) {
                    if (r) {
                        q[p].call(e, r)
                    } else {
                        q[p].call(e)
                    }
                }
            }
            return e
        },
        off: function(s, r) {
            var e = this,
                q = e["_on" + s],
                t = r.toString();
            for (var p = 0; p < q.length; p++) {
                if (t === q[p].toString()) {
                    q.splice(p, 1);
                    break
                }
            }
            return e
        },
        unload: function() {
            var p = this;
            var e = p._audioNode;
            for (var r = 0; r < p._audioNode.length; r++) {
                if (!e[r].paused) {
                    p.stop(e[r].id)
                }
                if (!p._webAudio) {
                    e[r].src = ""
                } else {
                    e[r].disconnect(0)
                }
            }
            var q = n._howls.indexOf(p);
            if (q !== null && q >= 0) {
                n._howls.splice(q, 1)
            }
            delete a[p._src];
            p = null
        }
    };
    if (c) {
        var j = function(r, p) {
            if (p in a) {
                r._duration = a[p].duration;
                i(r)
            } else {
                var s = new XMLHttpRequest();
                s.open("GET", p, true);
                s.responseType = "arraybuffer";
                s.onload = function() {
                    o.decodeAudioData(s.response, function(e) {
                        if (e) {
                            a[p] = e;
                            i(r, e)
                        }
                    }, function(e) {
                        r.on("loaderror")
                    })
                };
                s.onerror = function() {
                    if (r._webAudio) {
                        r._buffer = true;
                        r._webAudio = false;
                        r._audioNode = [];
                        delete r._gainNode;
                        r.load()
                    }
                };
                try {
                    s.send()
                } catch (q) {
                    s.onerror()
                }
            }
        };
        var i = function(p, e) {
            p._duration = (e) ? e.duration : p._duration;
            if (Object.getOwnPropertyNames(p._sprite).length === 0) {
                p._sprite = {
                    _default: [0, p._duration * 1000]
                }
            }
            if (!p._loaded) {
                p._loaded = true;
                p.on("load")
            }
            if (p._autoplay) {
                p.play()
            }
        };
        var l = function(q, e, r) {
            var p = q._nodeById(r);
            p.bufferSource = o.createBufferSource();
            p.bufferSource.buffer = a[q._src];
            p.bufferSource.connect(p.panner);
            p.bufferSource.loop = e[0];
            if (e[0]) {
                p.bufferSource.loopStart = e[1];
                p.bufferSource.loopEnd = e[1] + e[2]
            }
            p.bufferSource.playbackRate.value = q._rate
        }
    }
    if (typeof define === "function" && define.amd) {
        define(function() {
            return {
                Howler: n,
                Howl: f
            }
        })
    }
    if (typeof exports !== "undefined") {
        exports.Howler = n;
        exports.Howl = f
    }
    window.Howler = n;
    window.Howl = f
})();
Class(function Sound() {
    Inherit(this, Model);
    var g = this;
    var e = g.initClass(DynamicObject, {
        v: 1
    });
    var c = [];
    var f = ["1_a_new_orbit_rev", "2_comet_hunter_rev", "3_changing_times_rev", "4_contact_rev", "comet_seamless_loop", ];
    this.muted = false;
    (function() {
        d()
    })();

    function b() {
        for (var k = 0; k < f.length; k++) {
            var m = f[k];
            var l = Config.SOUNDS + m;
            var h = new Howl({
                urls: [l + ".mp3", l + ".ogg"]
            });
            var j = m;
            g[j] = h
        }
    }

    function d() {
        g.events.subscribe(HydraEvents.BROWSER_FOCUS, a)
    }

    function a(k) {
        if (k.type == "blur") {
            for (var h in g) {
                var j = g[h];
                if (j.pause && j.__playing) {
                    j.pause()
                }
            }
        } else {
            for (var h in g) {
                var j = g[h];
                if (j.pause && j.__playing) {
                    j.play()
                }
            }
        }
    }
    this.play = function(h, i) {
        c.push(g[h]);
        g[h].__playing = i;
        g[h].pos(0).loop(true).volume(i).play()
    };
    this.fade = function(h, m, l, j, k) {
        var i = g[h];
        if (!i.d) {
            i.d = g.initClass(DynamicObject, {
                v: 0
            })
        }
        i.d.v = m;
        i.d.tween({
            v: l
        }, j, "easeOutSine", function() {
            i.volume(i.d.v)
        }, k);
        if (l > 0) {
            i.__playing = true
        } else {
            i.__playing = false
        }
    };
    this.fadeAndPause = function() {
        e.tween({
            v: 0
        }, 3000, "easeOutSine", function() {
            for (var h = 0; h < c.length; h++) {
                c[h].volume(e.v * c[h].__playing)
            }
        }, function() {
            for (var h = 0; h < c.length; h++) {
                var j = c[h];
                j.__playing = false;
                j.stop().pos(0)
            }
            c.length = 0
        })
    };
    this.stopAll = function() {
        for (var h in g) {
            var i = g[h];
            if (i.stop) {
                i.stop()
            }
        }
    };
    this.init = function() {
        b()
    };
    this.cleanUp = this.cleanup = function(h) {
        g.delayedCall(function() {
            var i = g[h];
            if (i.__playing || i.volume() > 0.1) {
                if (!i.d) {
                    i.d = g.initClass(DynamicObject, {
                        v: i.volume()
                    })
                }
                i.d.tween({
                    v: 0
                }, 1000, "easeOutSine", function() {
                    i.volume(i.d.v)
                }, function() {
                    i.__playing = false
                })
            }
        }, 1000)
    }
}, "Static");
Class(function TimelineModel() {
    Inherit(this, Model);
    var b;
    (function() {
        a()
    })();

    function a() {
        b = Config.TIMELINE;
        var m = 0;
        var c = new Date();
        var h = c.getFullYear() + (c.getMonth() + 1) / 12;
        b[b.length - 1].date = h;
        var j = b[0].date;
        var g = h - j;
        var l = Data.CHAPTERS.getData();
        for (var f = 0; f < b.length; f++) {
            var k = b[f];
            k.time_code = l[f].timeIn;
            k.title = l[f].title;
            k.height = 50;
            k.index = f;
            var e = b[f + 1] ? b[f + 1].date : h;
            k.start = m;
            k.end = (e - j) / g * 0.91;
            if (k.end > 1 || f == b.length - 1) {
                k.end = 1
            }
            k.perc = k.end - k.start;
            k.endTime = l[f + 1] ? l[f + 1].timeIn : Config.DURATION;
            k.duration = k.endTime - k.time_code;
            m += k.perc
        }
    }
    this.getData = function() {
        return b
    };
    this.getFromPerma = function(c) {
        for (var d = 0; d < b.length; d++) {
            if (c == b[d].perma) {
                return b[d]
            }
        }
    }
});
Class(function TooltipsModel(a) {
    Inherit(this, Model);
    var d = this;
    var b;
    (function() {
        c()
    })();

    function c() {
        b = {};
        for (var h in a) {
            var j = a[h];
            var g = j.id.split("-");
            var f = g[1];
            var e = g[2];
            for (var h = 3; h < g.length; h++) {
                e += "-" + g[h]
            }
            var k = {
                heading: j.heading,
                copy: j.copy
            };
            if (!b[f]) {
                b[f] = {}
            }
            b[f][e] = k
        }
    }
    this.getTip = function(f, e) {
        return b[f][e]
    }
});
Class(function TitlesModel(c) {
    Inherit(this, Model);
    var d = this;
    var b;
    (function() {
        a()
    })();

    function a() {
        b = [];
        for (var e in c) {
            b.push({
                heading: c[e].title_text_head,
                subheading: c[e].title_text_sub,
                trans_in: c[e].transition_in,
                trans_out: c[e].transition_out,
                time_in: parseFloat(c[e].time_in),
                time_out: parseFloat(c[e].time_out),
                pos: c[e].position
            })
        }
    }
    this.getTitles = function() {
        return b
    }
});
Class(function MomentsModel(c) {
    Inherit(this, Model);
    var h = this;
    var f;
    var n;
    var l = new LinkedList();
    var k = [];
    (function() {
        Global.INIT_MOMENT = window.location.hash.strpos("!") ? "" : window.location.hash.slice(1);
        Global.MOMENT = {};
        m();
        i();
        Data.VIDEO.tick(b)
    })();

    function m() {
        for (var q = 0; q < c.length; q++) {
            var p = c[q];
            if (p.time && p.time.length && p.className && p.className.length) {
                var r = {};
                r.inTime = parseFloat(p.time);
                r.outTime = r.inTime + parseFloat(p.duration);
                r.activated = false;
                r.className = p.className;
                r.duration = parseFloat(p.duration);
                l.push(r)
            }
        }
    }

    function e(p) {
        for (var q in c) {
            if (c[q].perma == p) {
                return c[q]
            }
        }
    }

    function a(p) {
        f = new window[p.className](p);
        f._data = p;
        DummyShotMoment.copy(f);
        Global.MOMENT[p.className] = f;
        k.push(f);
        Tooltips.instance().cursor(true);
        if (Global.CHAPTER_INDEX >= 0) {
            GATracker.trackEvent("video_moment", "ch" + (Global.CURRENT_CHAPTER_INDEX + 1), p.perma)
        }
        switch (p.perma) {
            case "aneworbit":
            case "changing-times":
            case "contact":
            case "comet-hunter":
            case "today":
                n = p.perma;
                break
        }
    }

    function i() {
        h.events.subscribe(ContactEvents.PAUSE, o);
        h.events.subscribe(ContactEvents.RESUME, d);
        h.events.subscribe(ContactEvents.RESET_3D, g)
    }

    function d() {
        for (var p = 0; p < k.length; p++) {
            if (k[p].resume) {
                k[p].resume()
            }
        }
    }

    function o() {
        for (var p = 0; p < k.length; p++) {
            if (k[p].pause) {
                k[p].pause()
            }
        }
    }

    function g(r) {
        for (var p = 0; p < k.length; p++) {
            if (k[p].destroy) {
                if (k[p].stopTweens) {
                    k[p].stopTweens()
                }
                k[p].destroy()
            }
            h.remove(k[p])
        }
        var q = l.start();
        while (q) {
            q.activated = false;
            q = l.next()
        }
        if (r) {
            h.initFrom(r.time)
        }
    }

    function b(q) {
        var p = l.start();
        while (p) {
            if (q.time > p.inTime && q.time < p.inTime + 1) {
                if (!p.activated) {
                    p.activated = true;
                    a(p)
                }
            }
            p = l.next()
        }
        j(q)
    }

    function j(u) {
        for (var p = 0; p < k.length; p++) {
            var t = k[p];
            if (t && t.listeners) {
                var r = Utils.convertRange(u.time, t._data.inTime, t._data.outTime, 0, 1);
                for (var q = t.listeners.length - 1; q > -1; q--) {
                    if (!t.listeners) {
                        ontinue
                    }
                    var s = t.listeners[q];
                    if (r >= s.percent && !s.fired) {
                        s.callback();
                        s.fired = true
                    }
                }
            }
        }
    }
    this.initMoment = function(p, q) {
        var r = e(p);
        if (!r) {
            return
        }
        if (!Global.PREVIEW || q) {
            Data.VIDEO.initFrom(r.time)
        } else {
            a(r)
        }
    };
    this.initOverview = function() {
        var p = e("overview-moment");
        a(p);
        Data.SHOTS.initOverview()
    };
    this.initLive = function() {
        var p = e("livemoment");
        a(p)
    };
    this.initFrom = function(q) {
        var p = l.start();
        while (p) {
            if (q > p.inTime) {
                p.activated = true
            }
            p = l.next()
        }
    };
    this.remove = function(q) {
        if (!q || !q._data) {
            return
        }
        if (q.stopTweens) {
            q.stopTweens()
        }
        Global.MOMENT[q._data.className] = DummyShotMoment;
        var p = k.indexOf(q);
        if (p > -1) {
            k.splice(p, 1)
        }
        q.destroy();
        if (!k.length) {
            Tooltips.instance().cursor(false)
        }
    };
    this.listen = function(r, p, s) {
        if (!r.listeners) {
            r.listeners = []
        }
        var q = {};
        q.percent = p;
        q.fired = false;
        q.callback = s;
        r.listeners.push(q)
    };
    this.initLast = function() {
        if (n == "overview-moment" || !n) {
            n = "aneworbit"
        }
        this.initMoment(n, true)
    };
    this.clear = function() {
        g()
    };
    this.end = function() {
        n = null
    }
});
Class(function CameraModel() {
    Inherit(this, Model);
    var d = this;
    var h, I, v, k, x;
    var z, E;
    var f = [];
    var x = new THREE.PerspectiveCamera();
    var i = new THREE.Vector3();
    var C = new THREE.Quaternion();
    var K = new THREE.Vector3();
    var B = new THREE.Vector3();
    var g = new THREE.Quaternion();
    var e = new THREE.Vector3();
    var l = new THREE.Object3D();
    var O = d.initClass(DynamicObject, {
        t: 0
    });
    var o = true,
        p = new THREE.Vector3();
    var t = 100,
        L = 0,
        M = 0;
    var N = 800000;
    var n = 10;
    var D = new THREE.Object3D(),
        q = 1000,
        m = new THREE.PerspectiveCamera(),
        r = new THREE.PerspectiveCamera(45, 1280 / 720, n, N),
        u;
    this.worldCamera = new THREE.PerspectiveCamera();
    this.perspective = new THREE.PerspectiveCamera();
    this.alpha = 1;
    this.orbitCamera = r;
    (function() {
        if (window.location.hash.strpos("playground")) {
            return
        }
        E = d.perspective;
        d.worldCamera.scale = new THREE.Vector3();
        F();
        H();
        Render.startRender(c)
    })();

    function F() {
        u = new THREE.ViewControls(r);
        r.position.z = q;
        Render.nextFrame(function() {
            if (Global.ELEMENTS && Global.ELEMENTS.scene) {
                Global.ELEMENTS.scene.add(D)
            }
            D.add(r)
        });
        d.orbitCamera.x = 0;
        d.orbitCamera.y = 0;
        d.orbitCamera.fullWidth = d.orbitCamera.width = 1280;
        d.orbitCamera.fullHeight = d.orbitCamera.height = 720
    }

    function w() {
        if (!k || !k.matrixWorld || k.destroyed) {
            return a()
        }
        k.matrixWorld.decompose(B, g, e);
        E.position.copy(i).lerp(B, O.t);
        THREE.Quaternion.slerp(C, g, E.quaternion, O.t);
        y();
        if (I) {
            I(O.t)
        }
        if (z) {
            r.updateProjectionMatrix()
        }
    }

    function G() {
        if (h) {
            h()
        }
        h = I = null;
        O.tweening = false;
        z = false
    }

    function A(P) {
        v = k;
        k = P
    }

    function J(R) {
        f.push(R);
        for (var Q = 0; Q < f.length; Q++) {
            var P = f[Q];
            if (!P || !P.pause) {
                f.splice(Q, 1)
            }
        }
    }

    function a() {
        for (var Q = 0; Q < f.length; Q++) {
            var P = f[Q];
            if (!P || !P.pause) {
                f.splice(Q, 1)
            } else {
                P.stop()
            }
        }
        z = false;
        O.tweening = false
    }

    function c() {
        r.updateMatrixWorld();
        r.matrixWorld.decompose(d.worldCamera.position, d.worldCamera.quaternion, d.worldCamera.scale);
        u.loop();
        if (!k || !k.updateMatrixWorld) {
            return
        }
        if (!O.tweening) {
            d.orbitDistance = k.orbitDistance;
            k.updateMatrixWorld();
            k.matrixWorld.decompose(x.position, x.quaternion, x.scale);
            d.offsetX = k.offsetX;
            d.offsetY = k.offsetY;
            E.position.lerp(x.position, d.alpha);
            E.quaternion.slerp(x.quaternion, d.alpha)
        }
        if (!O.tweening) {
            y()
        }
    }

    function y() {
        E.updateMatrix();
        var P = E.matrix.elements;
        D.quaternion.copy(E.quaternion);
        p.set(P[8], P[9], P[10]);
        p.setLength(-q);
        D.position.copy(E.position);
        D.position.add(p);
        r.position.setLength(q)
    }

    function s(Q, R, S, U, T) {
        if (Q.destroyed) {
            return
        }
        if (Q.fov != k.fov) {
            z = true;
            J(TweenManager.tween(r, {
                fov: Q.fov
            }, R, S))
        }
        if (d.offsetX != Q.offsetX) {
            J(TweenManager.tween(d, {
                offsetX: Q.offsetX
            }, R, S))
        }
        if (d.offsetY != Q.offsetY) {
            J(TweenManager.tween(d, {
                offsetY: Q.offsetY
            }, R, S))
        }
        J(TweenManager.tween(d, {
            orbitDistance: Q.orbitDistance
        }, R, S));
        A(Q);
        var P = v;
        while (P.parent) {
            P = P.parent
        }
        if (!P || !P.updateMatrixWorld) {
            return a()
        }
        P.updateMatrixWorld();
        v.updateMatrixWorld();
        v.matrixWorld.decompose(i, C, K);
        i.copy(E.position);
        C.copy(E.quaternion);
        h = T;
        I = U;
        O.t = 0;
        J(O.tween({
            t: 1
        }, R, S, w, G));
        O.tweening = true
    }

    function H() {}

    function b() {
        Render.stopRender(c);
        for (var Q = 0; Q < f.length; Q++) {
            var P = f[Q];
            if (P && P.pause) {
                P.pause()
            }
        }
    }

    function j() {
        Render.startRender(c);
        for (var Q = 0; Q < f.length; Q++) {
            var P = f[Q];
            if (P && P.resume) {
                P.resume()
            }
        }
    }
    this.register = function(P) {
        if (!k) {
            k = P
        }
    };
    this.target = function(P) {
        if (P.live) {
            a()
        }
        if (Global.LIVE && !P.live) {
            return
        }
        if (P.reference) {
            P = P.reference
        }
        A(P)
    };
    this.getState = function(P) {
        return k.getState(P)
    };
    this.pivot = function(P) {
        o = P;
        u.enabled = P
    };
    this.set("fov", function(P) {
        r.fov = P;
        r.updateProjectionMatrix()
    });
    this.set("offsetX", function(P) {
        r.x = P * r.fullWidth;
        r.updateProjectionMatrix()
    });
    this.set("offsetY", function(P) {
        r.y = P * r.fullHeight;
        r.updateProjectionMatrix()
    });
    this.get("offsetX", function() {
        return (r.x / r.fullWidth) || 0
    });
    this.get("offsetY", function() {
        return (r.y / r.fullHeight) || 0
    });
    this.get("orbitDistance", function() {
        return q
    });
    this.set("orbitDistance", function(P) {
        q = P
    });
    this.get("minTheta", function() {
        return u.minTheta
    });
    this.set("minTheta", function(P) {
        u.minTheta = P
    });
    this.get("maxTheta", function() {
        return u.maxTheta
    });
    this.set("maxTheta", function(P) {
        u.maxTheta = P
    });
    this.get("maxPolarAngle", function() {
        return u.maxPolarAngle
    });
    this.set("maxPolarAngle", function(P) {
        u.maxPolarAngle = P
    });
    this.get("minPolarAngle", function() {
        return u.minPolarAngle
    });
    this.set("minPolarAngle", function(P) {
        u.minPolarAngle = P
    });
    this.get("orbitFriction", function() {
        return u.orbitFriction
    });
    this.set("orbitFriction", function(P) {
        u.orbitFriction = P
    });
    this.tweenTarget = function(Q, R, S, P, U, T) {
        if (Global.LIVE && !Q.live) {
            return
        }
        if (Q.reference) {
            Q = Q.reference
        }
        if (!P) {
            s(Q, R, S, U, T)
        } else {
            d.delayedCall(function() {
                s(Q, R, S, U, T)
            }, P)
        }
    };
    this.sync = function() {
        Render.nextFrame(function() {
            var P = d.alpha;
            d.alpha = 1;
            c();
            d.alpha = P
        })
    };
    this.dragMode = function(P) {
        u.dragMode(P)
    };
    this.reset = function() {
        u.reset()
    };
    this.resetTween = function(Q, R, P) {
        u.resetTween(Q, R, P)
    };
    this.resetPlanes = function() {
        r.near = n;
        r.far = N;
        r.updateProjectionMatrix()
    };
    this.setPlanes = function(Q, P) {
        r.near = Q;
        r.far = P;
        r.updateProjectionMatrix()
    };
    this.reset3D = function() {
        a()
    };
    this.updateAspect = function(P) {
        r.aspect = P;
        r.updateProjectionMatrix()
    };
    this.updateProjection = function() {
        r.updateProjectionMatrix()
    }
});
Class(function VideoModel(I) {
    Inherit(this, Model);
    var d = this;
    var e, E, z;
    var q, h = "journey";
    var u = new LinkedList();
    var H = d.initClass(DynamicObject, {
        v: 1
    });
    var a = new LinkedList();
    var j = new LinkedList();
    (function() {
        if (!ContactDevice.NO_WEBGL) {
            Config.MOBILE_OFFSET = 0
        }
        l();
        A();
        k();
        G();
        B();
        Render.nextFrame(B)
    })();

    function l() {
        if (Config.DEBUG || Global.DEBUG) {
            z = Stage.create("text");
            z.fontStyle("Arial", 14, "#fff").setZ(99999)
        }
    }

    function A() {
        for (var L in I) {
            var K = I[L];
            var M = {};
            M.time = parseFloat(K.time);
            M.type = K.transitionType;
            j.push(M)
        }
    }

    function k() {
        var K = Config.VIDEO_FOLDER + "documentary";
        if (Device.browser.firefox) {
            K = Config.VIDEO_FOLDER + "documentary.ogv"
        }
        if (!ContactDevice.WEBGL) {
            if (Mobile.phone) {
                K = Config.VIDEO_FOLDER + "mobile.mp4"
            } else {
                K = Config.VIDEO_FOLDER + "mobile-tablet.mp4"
            }
        }
        e = new Video({
            src: K,
            width: 1280,
            height: 720,
            loop: false
        });
        if (!window.location.href.strpos("activetheorylab") && ContactDevice.WEBGL) {
            e.div.crossOrigin = "anonymous"
        }
        if (!Mobile.phone || Mobile.os != "iOS") {
            e.events.add(HydraEvents.ERROR, F);
            e.events.add(HydraEvents.READY, J)
        }
        e.events.add(HydraEvents.UPDATE, i);
        e.events.add(HydraEvents.COMPLETE, c);
        if (Config.MUTE) {
            e.volume(0)
        }
    }

    function v() {
        e.volume(H.v)
    }

    function o(K) {
        if (Global.SHOT.LiveShot && typeof Global.SHOT.LiveShot === "function") {
            Global.SHOT.LiveShot.resume()
        }
        if (Global.GL.resume) {
            Global.GL.resume()
        }
        if (!Global.GL || Global.LIVE) {
            return
        }
        Global.LIVE = true;
        b();
        Sound.fadeAndPause();
        if (!K) {
            Overlay.instance().startLoading("LOADING ISEE-3 CURRENT POSITION", L)
        } else {
            L()
        }

        function L() {
            if (Global.VIDEO_SCENE) {
                Global.VIDEO_SCENE.hide()
            }
            Data.MOMENTS.clear();
            Data.SHOTS.clear();
            Global.ELEMENTS.loadLive(function() {
                Data.MOMENTS.initLive();
                d.delayedCall(function() {
                    Overlay.instance().stopLoading()
                }, 3000)
            })
        }
    }

    function C(K) {
        if (!Global.GL) {
            return
        }
        Global.LIVE = false;
        if (!K) {
            Overlay.instance().startLoading("RESUMING JOURNEY", L)
        } else {
            L()
        }
        Sound.fadeAndPause();

        function L() {
            if (Global.GL.resume) {
                Global.GL.resume()
            }
            Global.CHAPTER_SEEK = true;
            Data.MOMENTS.clear();
            Data.SHOTS.clear();
            Data.MOMENTS.remove(Global.MOMENT.LiveMoment);
            Data.SHOTS.remove(Global.SHOT.LiveShot);
            if (!ContactDevice.PREVENT_3D) {
                Data.MOMENTS.initLast()
            } else {
                if (Global.VIDEO_SCENE) {
                    Global.VIDEO_SCENE.show()
                }
            }
            w();
            Global.GL.reset();
            if (Global.ELEMENTS.video) {
                Global.ELEMENTS.video.reset()
            }
            Global.SCENE_VIEW.show();
            d.delayedCall(function() {
                Global.CHAPTER_SEEK = false;
                Overlay.instance().stopLoading()
            }, 2500)
        }
    }

    function G() {
        d.events.subscribe(ContactEvents.RESIZE, B);
        d.events.subscribe(ContactEvents.TIMELINE_SEEK, p);
        d.events.subscribe(ContactEvents.HOMEPAGE, g);
        d.events.subscribe(HydraEvents.BROWSER_FOCUS, D);
        d.events.subscribe(ContactEvents.PLAY_PAUSE, x);
        d.events.subscribe(ContactEvents.NAV_CLICK, f);
        __window.keydown(s)
    }

    function f(L) {
        if (!Global.GL || !Global.GL.pause) {
            return
        }
        Global.GL.pause();
        switch (L.type) {
            case "live":
                Tooltips.instance().unfreeze();
                var K = h != "journey" && h != "";
                o(K);
                h = "live";
                break;
            case "journey":
                Tooltips.instance().unfreeze();
                var K = h != "live" && h != "";
                C(K);
                h = "journey";
                break;
            default:
                Tooltips.instance().freeze();
                d.events.fire(ContactEvents.PAUSE);
                b();
                break
        }
    }

    function D(K) {
        if (K.type == "blur") {
            q = e.playing;
            e.pause();
            d.events.fire(ContactEvents.PAUSE)
        } else {
            if (q) {
                e.play();
                d.events.fire(ContactEvents.RESUME)
            }
        }
    }

    function F() {
        q = e.playing;
        d.events.fire(ContactEvents.PAUSE, {
            buffering: true
        });
        Overlay.instance().startBuffering();
        e.play()
    }

    function J() {
        Overlay.instance().stopBuffering();
        if (q) {
            e.play();
            d.events.fire(ContactEvents.RESUME, {
                buffering: true
            })
        }
    }

    function s(K) {
        if (Global.END_PAUSE) {
            return
        }
        if (K.keyCode == 32) {
            if (!e.time || Global.CHAPTER_OVERVIEW || e.time <= 0 || Global.LIVE_TRAJECTORY || Global.NOT_ON_JOURNEY) {
                return
            }
            if (e.playing) {
                b()
            } else {
                w()
            }
        }
    }

    function w() {
        e.play();
        e.volume(0);
        H.v = 0;
        H.tween({
            v: 1
        }, 500, "linear", 100, v);
        d.events.fire(ContactEvents.RESUME)
    }

    function b(K) {
        H.v = e.div.volume;
        H.tween({
            v: 0
        }, 100, "linear", v, function() {
            e.pause()
        });
        if (!K) {
            d.events.fire(ContactEvents.PAUSE)
        }
    }

    function x(K) {
        if (K.play) {
            w()
        } else {
            b()
        }
    }

    function p(M) {
        if (Global.CHAPTER_SEEK) {
            return
        }
        Global.CHAPTER_SEEK = true;
        switch (M.perma) {
            case "a-new-orbit":
                Global.CURRENT_CHAPTER_INDEX = 0;
                break;
            case "comet-chaser":
                Global.CURRENT_CHAPTER_INDEX = 1;
                break;
            case "changing-times":
                Global.CURRENT_CHAPTER_INDEX = 2;
                break;
            case "contact":
                Global.CURRENT_CHAPTER_INDEX = 3;
                break;
            case "a-new-era":
                Global.CURRENT_CHAPTER_INDEX = 4;
                break
        }
        if (!ContactDevice.IPHONE) {
            Sound.fadeAndPause();
            H.tween({
                v: 0
            }, 2000, "easeOutSine", v);
            Overlay.instance().fade(1, 500, "easeOutSine", K);
            d.delayedCall(L, 2000)
        } else {
            Global.CHAPTER_SEEK = false;
            K()
        }

        function K() {
            if (!ContactDevice.NO_WEBGL) {
                n();
                d.events.fire(ContactEvents.RESET_3D, {
                    time: M.time_code
                });
                Data.CAMERA.reset3D();
                Data.CHAPTERS.reset(M.time_code)
            } else {
                if (ContactDevice.PREVENT_3D) {
                    Data.MOMENTS.remove(Global.MOMENT.LiveMoment);
                    Data.SHOTS.remove(Global.SHOT.LiveShot);
                    if (Global.VIDEO_SCENE) {
                        Global.VIDEO_SCENE.show()
                    }
                }
            } if (ContactDevice.WEBGL) {
                Global.TITLE_NAMES.clear()
            }
            Tooltips.instance().reset();
            if (M.time_code == 0 && !M.start) {
                Global.COMPLETION = 0;
                if (ContactDevice.WEBGL) {
                    Data.MOMENTS.initOverview()
                }
                e.seek(0 + Config.MOBILE_OFFSET);
                e.pause()
            } else {
                var O = M.start ? 0 : Config.MOBILE_OFFSET;
                var N = M.time_code + 0.5 + O;
                e.seek(N);
                e.play()
            }
        }

        function L() {
            H.tween({
                v: 1
            }, 2000, "easeInOutSine", v);
            Overlay.instance().fade(0, 500, "easeInOutSine", function() {
                Global.CHAPTER_SEEK = false
            })
        }
    }

    function g() {
        h = "";
        if (Global.GL.resume) {
            Global.GL.resume()
        }
        Global.CHAPTER_SEEK = true;
        Global.HOME_PAGE = true;
        Global.LIVE = false;
        Global.COMPLETION = 0;
        Sound.fadeAndPause();
        H.tween({
            v: 0
        }, 1000, "easeOutSine", v);
        Overlay.instance().fade(1, 500, "easeOutSine", function() {
            e.seek(0);
            e.pause();
            Global.STATE_MODEL.replaceState("home");
            Global.TITLE_NAMES.clear();
            Tooltips.instance().reset();
            if (ContactDevice.WEBGL) {
                n();
                Data.MOMENTS.clear();
                Data.SHOTS.clear();
                Data.CAMERA.reset3D();
                Data.CHAPTERS.reset(0);
                Data.MOMENTS.initOverview()
            }
            d.delayedCall(function() {
                H.tween({
                    v: 1
                }, 1000, "easeInOutSine", v);
                Overlay.instance().fade(0, 500, "easeInOutSine", function() {
                    Global.CHAPTER_SEEK = false;
                    Global.HOME_PAGE = false
                })
            }, 500)
        })
    }

    function B() {
        if (Data.CAMERA) {
            Data.CAMERA.reset()
        }
        d.height = Stage.width * (720 / 1280);
        if (ContactDevice.PREVENT_3D) {
            d.height = Stage.height;
            if (Data.CAMERA) {
                Data.CAMERA.updateAspect(Stage.width / Stage.height)
            }
        }
    }

    function i(K) {
        Global.TIMECODE = Math.max(0, K.time - Config.MOBILE_OFFSET);
        Global.DURATION = K.duration - Config.MOBILE_OFFSET;
        Global.COMPLETION = Global.TIMECODE / Global.DURATION;
        if (ContactDevice.WEBGL) {
            m(K);
            r(K);
            y(K)
        }
        if (z) {
            z.text(K.time)
        }
    }

    function m(M) {
        var L = Global.COMPLETION;
        var K = u.start();
        while (K) {
            if (!K.fired) {
                if (L >= K.timecode) {
                    K.fired = true;
                    K.callback()
                }
            } else {
                if (L < K.timecode) {
                    K.fired = false
                }
            }
            K = u.next()
        }
        r(M);
        y(M);
        if (z && M) {
            z.text(M.time)
        }
    }

    function r(L) {
        var K = a.start();
        while (K) {
            K(L);
            K = a.next()
        }
    }

    function y(L) {
        var K = j.start();
        while (K) {
            if (L && L.time >= K.time) {
                if (!K.fired) {
                    K.fired = true;
                    if (K.type == "out") {
                        Global.ELEMENTS.video.hide()
                    } else {
                        Global.ELEMENTS.video.show()
                    }
                }
            }
            K = j.next()
        }
    }

    function t(L) {
        var K = j.start();
        while (K) {
            if (L > K.time) {
                K.fired = true
            }
            K = j.next()
        }
        Data.CHAPTERS.reset(L)
    }

    function c() {
        Global.STATE_MODEL.replaceState("");
        Data.MOMENTS.end();
        if (ContactDevice.WEBGL) {
            d.events.fire(ContactEvents.NAV_CLICK, {
                type: "live",
                index: 1
            })
        }
    }

    function n(L) {
        var K = j.start();
        while (K) {
            K.fired = false;
            K = j.next()
        }
    }
    this.get("reference", function() {
        return e
    });
    this.play = function(K) {
        if (K) {
            e.seek(0);
            e.volume(0);
            H.tween({
                v: 1
            }, 15000, "linear", v)
        }
        if (E) {
            E = 0;
            e.seek(0)
        } else {
            e.play()
        }
    };
    this.pause = function() {
        e.pause()
    };
    this.tick = function(K) {
        a.push(K)
    };
    this.initFrom = function(K) {
        if (ContactDevice.NO_WEBGL) {
            return
        }
        if (!K || Global.DEBUG) {
            return
        }
        e.seek(parseFloat(K))
    };
    this.volume = function(K) {
        e.volume(K)
    };
    this.killTransition = function(K) {
        j = new LinkedList()
    };
    this.isPlaying = function() {
        return e.playing
    };
    window.mute = function() {
        e.volume(0)
    };
    window.pause = b;
    window.resume = w;
    window.seek = function(K) {
        e.seek(K)
    };
    window.dumpTweens = function() {
        d.events.fire(ContactEvents.DUMP_TWEENS)
    };
    this.initFrom = function(K) {
        if (ContactDevice.NO_WEBGL) {
            return
        }
        if (!K || Global.DEBUG || Global.PREVIEW) {
            return
        }
        K = parseFloat(K);
        Data.MOMENTS.initFrom(K);
        Data.SHOTS.initFrom(K);
        t(K);
        e.seek(K)
    };
    this.continueVideo = function() {
        if (ContactDevice.NO_WEBGL) {
            return
        }
        Sound.fadeAndPause();
        Global.CURRENT_CHAPTER_INDEX++;
        if (e.time > 369 && e.time < 370) {
            d.delayedCall(function() {
                Overlay.instance().fade(1, 500, "easeOutSine", function() {
                    e.play();
                    Global.END_PAUSE = false;
                    d.delayedCall(function() {
                        Overlay.instance().fade(0, 500, "easeOutSine")
                    }, 500)
                })
            }, 500)
        } else {
            e.play();
            Global.END_PAUSE = false
        }
    };
    this.openPage = function() {};
    this.closePage = function() {};
    this.endChapter = function() {
        if (ContactDevice.NO_WEBGL) {
            return
        }
        e.pause();
        Global.END_PAUSE = true
    };
    this.mobileCycle = function() {
        if (ContactDevice.NO_WEBGL) {
            return
        }
        e.play()
    };
    this.get("video", function() {
        return e
    })
});
Class(function DummyShotMoment() {
    var b = this;
    (function() {})();

    function a() {}
    this.copy = function(c) {
        for (var d in c) {
            b[d] = a
        }
    }
}, "Static");
Class(function ChapterModel(e) {
    Inherit(this, Model);
    var g = this;
    var c = new LinkedList();
    var d = [];
    (function() {
        b();
        a();
        Data.VIDEO.tick(f)
    })();

    function a() {
        for (var h in e) {
            var j = {};
            j.time = parseFloat(e[h].timeOut);
            c.push(j)
        }
    }

    function b() {
        for (var h in e) {
            e[h].timeIn = parseFloat(e[h].timeIn);
            e[h].timeOut = parseFloat(e[h].timeOut)
        }
    }

    function f(n) {
        if (!n) {
            return
        }
        var m = c.start();
        while (m) {
            if (n.time >= m.time) {
                if (!m.fired) {
                    m.fired = true;
                    Data.VIDEO.endChapter();
                    Global.END_PAUSE = true;
                    Tooltips.instance().allowContinue();
                    if (Config.RECORD_MOBILE) {
                        g.delayedCall(Data.VIDEO.continueVideo, 25)
                    }
                }
            }
            m = c.next()
        }
        var h = d.length;
        for (var k = 0; k < h; k++) {
            var j = d[k];
            if (j && n.time >= j.time) {
                j.callback();
                d.splice(k, 1)
            }
        }
    }
    this.reset = function(i) {
        var h = c.start();
        while (h) {
            if (i > h.time) {
                h.fired = true
            } else {
                h.fired = false
            }
            h = c.next()
        }
        d.length = 0
    };
    this.listen = function(i, j) {
        var h = {};
        h.time = i;
        h.callback = j;
        d.push(h)
    };
    this.getData = function() {
        return e
    }
});
Class(function TrajectoryModel(f) {
    Inherit(this, Model);
    var e = this;
    var j = new THREE.Object3D();
    var d = new THREE.Vector3();
    var h = new THREE.Vector3();
    var c = {};
    (function() {
        b()
    })();

    function b() {
        var k = Config.PATH_GEOMETRY;
        for (var l in k) {
            g(l)
        }
    }

    function a(k, u, D, E) {
        u.points = [];
        k = k.split("\n");
        var n = 0,
            m = 1,
            l = 2;
        var o = Config.PATH_GEOMETRY[E].dates;
        if (o) {
            n++;
            m++;
            l++
        }
        if (Config.PATH_GEOMETRY[E].reverse) {
            k = k.reverse()
        }
        var t = Config.PATH_GEOMETRY[E].xdir || 1;
        var v = Config.PATH_GEOMETRY[E].ydir || -1;
        var B = Config.PATH_GEOMETRY[E].zdir || 1;
        var C = 0;
        for (var A = 0; A < k.length - 1; A++) {
            var s = k[A];
            s = s.split(",");
            var r = t * parseFloat(s[n]) * D;
            var q = v * parseFloat(s[m]) * D;
            var p = B * parseFloat(s[l]) * D;
            var w = new THREE.Vector3(r, q, p);
            u.points.push(w)
        }
    }

    function g(k) {
        var l = Hydra.JSON[k];
        if (!l || c[k]) {
            return
        }
        var m = {};
        c[k] = m;
        a(l, m, Config.PATH_GEOMETRY[k].scale, k);
        i(m, k)
    }

    function i(n, m) {
        var l = Config.PATH_GEOMETRY[m];
        var k = l.segments;
        n.spline = new THREE.SplineCurve3(n.points);
        n.tube = new THREE.TubeGeometry(n.spline, k, l.radius, 2, false)
    }
    this.getPath = function(k) {
        return c[k]
    };
    this.orient = function(k, n, t, v, x, m, y) {
        m = m || 0.02;
        var o = c[k];
        var s = o.spline.getPointAt(v);
        var w = o.spline.getTangentAt(v);
        var p = o.tube.tangents.length;
        var l = v * p;
        var q = Math.floor(l);
        var r = (q + 1) % p;
        d.subVectors(o.tube.binormals[r], o.tube.binormals[q]);
        d.multiplyScalar(l - q).add(o.tube.binormals[q]);
        h.copy(d);
        s.add(h.multiplyScalar(t));
        if (y) {
            y.updateMatrixWorld();
            s.applyMatrix4(y.matrixWorld)
        }
        j.position.copy(s);
        j.quaternion.setFromAxisAngle(w, x);
        d.applyQuaternion(j.quaternion);
        j.matrix.lookAt(j.position, s.add(w), d);
        j.rotation.setFromRotationMatrix(j.matrix, j.rotation.order);
        n.position.lerp(j.position, m);
        n.quaternion.copy(j.quaternion)
    };
    this.orient2 = function(k, n, t, v, x, m, y) {
        m = m || 0.02;
        var o = c[k];
        var s = o.spline.getPoint(v);
        var w = o.spline.getTangent(v);
        var p = o.tube.tangents.length;
        var l = v * p;
        var q = Math.floor(l);
        var r = (q + 1) % p;
        d.subVectors(o.tube.binormals[r], o.tube.binormals[q]);
        d.multiplyScalar(l - q).add(o.tube.binormals[q]);
        h.copy(d);
        s.add(h.multiplyScalar(t));
        if (y) {
            y.updateMatrixWorld();
            s.applyMatrix4(y.matrixWorld)
        }
        j.position.copy(s);
        j.quaternion.setFromAxisAngle(w, x);
        d.applyQuaternion(j.quaternion);
        j.matrix.lookAt(j.position, s.add(w), d);
        j.rotation.setFromRotationMatrix(j.matrix, j.rotation.order);
        n.position.lerp(j.position, m);
        n.quaternion.copy(j.quaternion)
    };
    this.initTrajectories = function() {
        b()
    }
});
Class(function Data() {
    Inherit(this, Model);
    var d = this;
    var c;
    (function() {
        Hydra.ready(b)
    })();

    function b() {
        XHR.get(Config.DATA, function(e) {
            c = e;
            d.events.fire(ContactEvents.DATA_READY)
        })
    }

    function a() {
        d.VIDEO = new VideoModel(c.transitions, c.chapters);
        d.MOMENTS = new MomentsModel(c.moments);
        d.SHOTS = new ShotsModel(c.shots);
        d.CHAPTERS = new ChapterModel(c.chapters);
        if (window.THREE) {
            d.TRAJECTORY = new TrajectoryModel();
            d.CAMERA = new CameraModel()
        }
        d.TITLES = new TitlesModel(c.titles);
        d.TOOLTIPS = new TooltipsModel(c.tooltips);
        d.ABOUT = new AboutModel(c.about, c.technology);
        d.TIMELINE = new TimelineModel()
    }
    this.init = function() {
        if (window.THREE) {
            ThreeUtils.instance()
        }
        a()
    }
}, "Static");
Class(function Playground() {
    Inherit(this, Controller);
    var f = this;
    var d;
    var c, a;
    (function() {
        e();
        b()
    })();

    function e() {
        d = f.container;
        d.size("100%");
        Global.PLAYGROUND.container = f.container
    }

    function b() {
        var h = window.location.hash.split("playground/");
        var g = Config.PLAYGROUND[h[1]];
        if (!g) {
            throw "No Config found for " + h[1]
        }
        Global.PLAYGROUND.base = window[g.base];
        Global.PLAYGROUND.config = g;
        f.initClass(Global.PLAYGROUND.base)
    }
});
Class(function Overlay() {
    Inherit(this, Controller);
    var c = this;
    var h, i;
    var d, e;
    (function() {
        b();
        g();
        a();
        f()
    })();

    function b() {
        h = c.container;
        h.size("100%").setZ(1000000).mouseEnabled(false);
        Global.SCENE_WRAPPER.addChild(h)
    }

    function g() {
        i = h.create(".cover");
        i.size("100%").bg("#000").css({
            opacity: 0
        })
    }

    function a() {
        d = c.initClass(BufferingAnim)
    }

    function f() {
        e = c.initClass(SatelliteAnim)
    }
    this.fade = function(j, k, l, m) {
        i.tween({
            opacity: j
        }, k, l, m)
    };
    this.setFade = function(j) {
        i.stopTween().css({
            opacity: j
        })
    };
    this.startBuffering = function() {
        h.mouseEnabled(true);
        d.animateIn();
        i.tween({
            opacity: 0.7
        }, 400, "easeOutSine")
    };
    this.stopBuffering = function() {
        h.mouseEnabled(false);
        d.animateOut();
        i.tween({
            opacity: 0
        }, 400, "easeOutSine")
    };
    this.startLoading = function(j, k) {
        h.mouseEnabled(true);
        e.animateIn(j);
        i.tween({
            opacity: 1
        }, 1000, "easeOutSine", function() {
            if (k) {
                k()
            }
        })
    };
    this.stopLoading = function(j) {
        h.mouseEnabled(false);
        e.animateOut();
        i.tween({
            opacity: 0
        }, 1000, "easeOutSine", function() {
            if (j) {
                j()
            }
        })
    }
}, "Singleton");
Class(function Loader() {
    Inherit(this, Controller);
    var i = this;
    var m;
    var e, g, k;
    (function() {
        f();
        c();
        j()
    })();

    function f() {
        m = i.container;
        m.size("100%").setZ(100000000000).mouseEnabled(false);
        Stage.addChild(m)
    }

    function l() {
        var o = ContactUtil.bundleAssets(["/colors", "/common", "/error", "/footer", "/glows", "/live", "/timeline"]);
        if (ContactDevice.WEBGL) {
            ContactUtil.bundleAssets(["/lib", "/labels", "/geometry/satellite_all", "/geometry/satellite_model", "/geometry/satellite_small", "/geometry/satellite_model", "/geometry/satellite_smooth", "/shaders", "/elements"], o)
        }
        if (Global.INIT_STATE == "about") {
            ContactUtil.bundleAssets(["/about"], o)
        } else {
            if (Global.INIT_STATE == "live") {
                k = true;
                ContactUtil.bundleAssets(["/live", "/geometry/moon.csv", "/geometry/satellite_future"], o)
            } else {
                if (Global.INIT_STATE == "data") {
                    ContactUtil.bundleAssets(["/data"], o)
                }
            }
        }
        e = i.initClass(AssetLoader, o);
        e.events.subscribe(HydraEvents.COMPLETE, b);
        e.events.subscribe(HydraEvents.PROGRESS, a)
    }

    function c() {
        g = i.initClass(LoaderView);
        g.events.add(HydraEvents.READY, l)
    }

    function j() {
        i.events.subscribe(ContactEvents.DATA_READY, n);
        i.events.subscribe(ContactEvents.WEBGL_READY, h)
    }

    function h() {}

    function b() {
        if (k) {
            Global.MOON_LOADED = true
        }
        d();
        i.events.fire(HydraEvents.COMPLETE)
    }

    function a(o) {
        g.update(o.percent)
    }

    function d() {
        var p = ContactUtil.bundleAssets(["/about", "/live", "/data", "/geometry/moon.csv", "/geometry/satellite_future"]);
        var o = new AssetLoader(p);
        o.events.add(HydraEvents.COMPLETE, function() {
            Global.MOON_LOADED = true
        })
    }

    function n() {
        if (e) {
            e.trigger(5)
        }
    }
    this.animateOut = function(p, o) {
        g.animateOut(p, o)
    }
});
Class(function About() {
    Inherit(this, Controller);
    var e = this;
    var b;
    var d;
    (function() {
        c();
        a()
    })();

    function c() {
        b = e.container;
        b.size("100%").css({
            top: 50
        })
    }

    function a() {
        d = e.initClass(AboutView)
    }
    this.animateIn = function(f) {
        d.animateIn(f)
    }
});
Class(function Scene() {
    Inherit(this, Controller);
    var i = this;
    var o;
    var m, d, f, g, k;
    (function() {
        e();
        n();
        a();
        h();
        if (!Device.mobile) {
            l();
            j()
        }
        i.events.fire(ContactEvents.WEBGL_READY)
    })();

    function e() {
        o = i.container;
        o.size("100%")
    }

    function h() {
        Global.PREVIEW = window.location.hash.strpos("preview");
        var r = window.location.hash.slice(1);
        if (!r.length || r.strpos("!")) {
            return
        }
        var q = r.split("/");
        Global.DEBUG = r.strpos("debug");
        Data.MOMENTS.initMoment(q[0]);
        i.delayedCall(function() {
            if (Global.PREVIEW) {
                Global.GL.showLayer("space");
                Global.GL.hideLayer("video")
            } else {
                Data.VIDEO.play()
            }
        }, 100)
    }

    function a() {
        g = i.initClass(SceneView);
        Elements.instance().scene = g;
        if (!ContactDevice.PREVENT_3D) {
            d = i.initClass(SceneVideoGL)
        }
        if (!Global.INIT_MOMENT.length) {
            Data.MOMENTS.initOverview()
        }
    }

    function n() {
        m = i.initClass(SceneRendererGL, o);
        o.add(m.domElement)
    }

    function l() {
        var q = o.create(".playpause");
        q.size(100, 100).center().mouseEnabled(false);
        Global.PLAYPAUSE_ICON = q;
        k = i.initClass(PlayPause, null);
        q.addChild(k)
    }

    function j() {
        i.events.subscribe(ContactEvents.PAUSE, p);
        i.events.subscribe(ContactEvents.RESUME, c);
        o.interact(null, b);
        o.hit.hide().css({
            top: "-100%"
        }).mouseEnabled(false);
        o.hit.div.style.cursor = "";
        o.hit.div.className = ""
    }

    function p() {
        if (Global.CHAPTER_OVERVIEW || Global.LIVE_TRAJECTORY || Global.NOT_ON_JOURNEY || Global.INTERACTIVE_MOMENT) {
            return
        }
        o.hit.hide().css({
            top: 0
        }).mouseEnabled(true);
        k.pause()
    }

    function c() {
        o.hit.hide().css({
            top: "-100%"
        }).mouseEnabled(false);
        k.play()
    }

    function b() {
        if (Global.CHAPTER_OVERVIEW || Global.LIVE_TRAJECTORY || Global.NOT_ON_JOURNEY || Global.INTERACTIVE_MOMENT) {
            return
        }
        i.events.fire(ContactEvents.PLAY_PAUSE, {
            play: true
        })
    }
});
Class(function SceneVideo() {
    Inherit(this, Controller);
    var n = this;
    var m, o, a;
    var g, e, f;
    (function() {
        p();
        h();
        k();
        q()
    })();

    function p() {
        m = n.container;
        m.size("100%").setZ(1).bg("#000");
        o = m.create(".wrapper");
        o.size("100%").hide();
        Global.VIDEO_SCENE = n;
        if (!ContactDevice.WEBGL) {
            a = m.create(".bg");
            a.size("100%").bg(Config.IMAGES + "intro/tablet-bg.jpg", "50%", "50%").css({
                backgroundSize: "cover"
            });
            if (Mobile.phone) {
                a.bg(Config.IMAGES + "intro/phone-bg.jpg", "50%", "50%").css({
                    backgroundSize: "cover"
                });
                if (Mobile.os == "iOS") {
                    o.css({
                        top: "100%"
                    })
                }
            }
        }
    }

    function h() {
        g = Data.VIDEO.video;
        o.add(g);
        if (ContactDevice.IPHONE) {
            g.div.preload = true;
            g.div.autoplay = "autoplay";
            g.div.addEventListener("ended", b);
            g.div.addEventListener("pause", b)
        } else {
            f = n.initClass(PlayPause);
            m.interact(null, l)
        }
    }

    function j() {
        e = n.initClass(IntroView, true);
        e.events.add(HydraEvents.CLICK, s)
    }

    function r() {
        n.playing = true;
        o.show();
        Data.VIDEO.play();
        if (f) {
            f.play()
        }
        n.delayedCall(q, 1000)
    }

    function c() {
        n.playing = false;
        Data.VIDEO.pause();
        if (f) {
            f.pause()
        }
    }

    function k() {
        n.events.subscribe(ContactEvents.RESIZE, q);
        n.events.subscribe(ContactEvents.BEGIN, s);
        n.events.subscribe(ContactEvents.TIMELINE_SEEK, i);
        n.events.subscribe(ContactEvents.RESUME, d);
        n.events.subscribe(ContactEvents.PAUSE, t)
    }

    function d() {
        if (!n.playing) {
            r()
        }
    }

    function t() {
        if (n.playing) {
            c()
        }
    }

    function l() {
        if (Global.NAV_OPEN) {
            return
        }
        if (n.playing) {
            c()
        } else {
            r()
        }
    }

    function b() {
        if (!e && ContactDevice.IPHONE) {
            j()
        }
        if (!g.div.webkitDisplayingFullscreen) {
            o.hide()
        }
    }

    function s(v) {
        if (v.live) {
            return
        }
        if (!ContactDevice.IPHONE) {
            r();
            a.hide();
            Overlay.instance().fade(1, 500, "easeOutSine", function() {
                m.show();
                Overlay.instance().fade(0, 500, "easeOutSine")
            })
        } else {
            Global.CHAPTER_SEEK = false;
            var u = Data.TIMELINE.getData();
            u[0].start = true;
            n.events.fire(ContactEvents.TIMELINE_SEEK, u[0])
        } if (Global.GL) {
            Global.GL.hide()
        }
        if (Global.GL) {
            Global.GL.pause()
        }
    }

    function q() {
        var u = Stage.width / (1280 / 720);
        Global.VIDEO_TOP_Y = Stage.height / 2 - u / 2;
        m.size(Stage.width, u).css({
            left: 0,
            top: Global.VIDEO_TOP_Y
        });
        g.size(Stage.width, u)
    }

    function i() {
        if (a && !ContactDevice.IPHONE) {
            a.hide()
        }
        r()
    }
    this.show = function() {
        o.show();
        m.show();
        if (Global.GL) {
            Global.GL.hide()
        }
    };
    this.hide = function() {
        o.hide();
        m.hide();
        if (Global.GL) {
            Global.GL.show()
        }
    }
});
Class(function Tooltips() {
    Inherit(this, Controller);
    var k = this;
    var q, p;
    var i, h;
    var a, o, l, n;
    (function() {
        g();
        c();
        f();
        m();
        d()
    })();

    function g() {
        q = k.container;
        q.size("100%").setZ(1000000).mouseEnabled(false).hide();
        Global.SCENE_WRAPPER.addChild(q)
    }

    function c() {
        i = k.initClass(TooltipsView)
    }

    function e() {
        if (l) {
            l = l.destroy()
        }
        var r = Device.detect("windows") ? {
            width: 170,
            text: "Continue &#8594;"
        } : {
            width: 160,
            text: "Continue &#10095;"
        };
        l = k.initClass(GhostButton, r);
        l.element.css({
            right: 50,
            bottom: "20%"
        }).mouseEnabled(true);
        l.events.add(HydraEvents.CLICK, j);
        d();
        k.delayedCall(l.animateIn, 200)
    }

    function f() {
        p = q.create(".title");
        p.fontStyle("GravurCondensed", 18, "#fff");
        p.css({
            width: "100%",
            textAlign: "center",
            top: 50,
            letterSpacing: 2
        }).setZ(100000000000).transform({
            z: 1
        })
    }

    function b() {
        p.text((Device.mobile ? "TOUCH AND DRAG" : "MOVE YOUR MOUSE") + "  TO EXPLORE");
        p.stopTween().transform({
            y: 20
        }).css({
            opacity: 0
        }).tween({
            opacity: 1,
            y: 0
        }, 600, "easeOutCubic", function() {
            p.stopTween().tween({
                opacity: 0,
                y: -10
            }, 400, "easeInSine", 1200, function() {
                p.text((Device.mobile ? "TOUCH" : "CLICK") + " ANY ELEMENT TO LEARN MORE");
                p.stopTween().transform({
                    y: 20
                }).css({
                    opacity: 0
                }).tween({
                    opacity: 1,
                    y: 0
                }, 600, "easeOutCubic", function() {
                    p.stopTween().tween({
                        opacity: 0,
                        y: -10
                    }, 400, "easeInSine", 1200)
                })
            })
        })
    }

    function m() {
        k.events.subscribe(ContactEvents.RESIZE, d)
    }

    function d() {
        var r = Global.VIDEO_TOP_Y || 0;
        if (r < 0) {
            r = 0
        }
        p.css({
            top: 50 + r
        });
        if (r < 100) {
            r = 100
        }
        if (l) {
            l.element.css({
                right: 50,
                bottom: r + 50
            })
        }
        i.resize(r)
    }

    function j() {
        k.visible = false;
        Data.VIDEO.continueVideo();
        i.animateOut();
        q.tween({
            opacity: 0
        }, 200, "easeOutSine", function() {
            p.stopTween().css({
                opacity: 0
            });
            q.hide().clearAlpha();
            if (l) {
                l = l.destroy()
            }
        })
    }
    this.animateIn = function() {
        if (Config.RECORD_MOBILE || Global.LIVE) {
            return
        }
        k.visible = true;
        q.show();
        k.delayedCall(b, 500)
    };
    this.allowContinue = function() {
        if (Config.RECORD_MOBILE || Global.LIVE) {
            return
        }
        if (!k.visible) {
            k.animateIn()
        }
        e()
    };
    this.hoverIn = function(s, r) {
        if (Config.RECORD_MOBILE) {
            return
        }
        GATracker.trackEvent("tooltip", "ch" + s, r);
        k.visible = true;
        q.show();
        if (a == s && o == r) {
            return
        }
        a = s;
        o = r;
        var t = Data.TOOLTIPS.getTip(a, o);
        i.animateIn(t);
        Render.nextFrame(d)
    };
    this.hoverOut = function() {
        a = null;
        if (Config.RECORD_MOBILE) {
            return
        }
        i.animateOut()
    };
    this.cursor = function(r) {
        if (n) {
            return
        }
        h = r;
        if (r) {
            Stage.div.className = "cursor_move"
        } else {
            Stage.div.className = ""
        }
    };
    this.footerCursor = function(r) {
        if (n) {
            return
        }
        if (r == "over") {
            Stage.div.className = ""
        } else {
            if (h) {
                Stage.div.className = "cursor_move"
            }
        }
    };
    this.reset = function() {
        if (l) {
            l = l.destroy()
        }
        i.animateOut()
    };
    this.freeze = function() {
        n = true;
        Stage.div.className = ""
    };
    this.unfreeze = function() {
        n = false
    }
}, "Singleton");
Class(function Timeline() {
    Inherit(this, Controller);
    var g = this;
    var d;
    var f;
    var b = Mobile.phone ? 40 : 350;
    var a = Mobile.phone ? 0 : 18;
    (function() {
        e();
        c()
    })();

    function e() {
        d = g.container;
        d.size("100%", b).css({
            top: -b + a
        }).setZ(99).mouseEnabled(false)
    }

    function c() {
        f = g.initClass(TimelineView)
    }
    this.animateIn = function() {
        f.animateIn()
    };
    this.animateOut = function() {
        f.animateOut()
    };
    this.up = function() {
        f.up()
    };
    this.down = function() {
        f.down()
    }
});
Class(function Titles() {
    Inherit(this, Controller);
    var f = this;
    var k;
    var l, a, i, e, c;
    var m;
    (function() {
        i = Data.TITLES.getTitles();
        d();
        j();
        g();
        Render.startRender(h);
        Global.TITLE_NAMES = f
    })();

    function d() {
        k = f.element;
        k.size(Stage.width, Stage.width * (720 / 1280)).css({
            top: (Stage.height - Stage.width * (720 / 1280)) / 2 - Config.TIMELINE_HEIGHT / 2
        }).setZ(1000000 + 20).mouseEnabled(false)
    }

    function j() {
        l = f.initClass(SceneTitle, "left", Stage.width * (720 / 1280));
        a = f.initClass(SceneTitle, "right", Stage.width * (720 / 1280));
        e = f.initClass(SceneTitle, "center", Stage.width * (720 / 1280));
        c = f.initClass(SceneTitle, "center_top", Stage.width * (720 / 1280));
        m = {
            left: l,
            right: a,
            center: e,
            center_top: c
        };
        if (!Config.TITLES) {
            k.hide()
        }
    }

    function h() {
        var q = Global.TIMECODE;
        for (var p = i.length - 1; p > -1; p--) {
            var o = i[p];
            var r = o.time_in;
            var n = o.time_out;
            if (q > r && q < n && !o.active) {
                if (m[o.pos]) {
                    m[o.pos].show(o);
                    o.active = true
                }
            } else {
                if ((q < r || q > n) && o.active) {
                    if (m[o.pos]) {
                        m[o.pos].hide(o);
                        o.active = false
                    }
                }
            }
        }
    }

    function g() {
        f.events.subscribe(ContactEvents.RESIZE, b)
    }

    function b() {
        k.size(Stage.width, Stage.width * (720 / 1280)).center();
        l.resize(Stage.width * (720 / 1280));
        a.resize(Stage.width * (720 / 1280));
        e.resize(Stage.width * (720 / 1280))
    }
    this.clear = function() {
        for (var n in m) {
            m[n].hide()
        }
    }
});
Class(function Footer() {
    Inherit(this, Controller);
    var e = this;
    var i;
    var j, h, a;
    e.down = true;
    var d = Mobile.phone ? 50 : 40;
    (function() {
        b();
        g();
        f()
    })();

    function b() {
        i = e.container;
        i.size("100%", d).bg("#000").css({
            top: 0,
            borderBottom: "1px solid #333",
            borderTop: "1px solid #333",
            overflow: "hidden"
        }).setZ(100).invisible()
    }

    function g() {
        if (!Mobile.phone) {
            j = e.initClass(FooterTitleView)
        } else {
            h = e.initClass(FooterMobileMenu)
        }
        a = e.initClass(FooterNavView)
    }

    function f() {
        if (h) {
            h.events.add(HydraEvents.CLICK, c)
        }
    }

    function c(k) {
        if (k.on) {
            a.animateIn()
        } else {
            a.animateOut()
        }
    }
    this.up = function() {
        i.tween({
            height: 60
        }, 700, "easeInOutCubic");
        e.height = 60;
        a.resize(e.height)
    };
    this.down = function() {
        i.tween({
            height: 40
        }, 600, "easeInOutCubic");
        e.height = 40;
        a.resize(e.height)
    };
    this.animateIn = function() {
        i.visible();
        if (!h) {
            a.animateIn()
        }
    };
    this.backToJourney = function() {
        if (h) {
            h.animateIn()
        }
        a.animateOut()
    };
    this.resize = function(k) {
        e.height = k;
        i.css({
            height: k
        });
        if (h) {
            h.resize(k)
        }
        if (a) {
            a.resize(k)
        }
    }
});
Class(function Live() {
    Inherit(this, Controller);
    var d = this;
    var a;
    var c;
    (function() {
        b()
    })();

    function b() {
        a = d.container;
        a.size("100%");
        Global.SCENE_WRAPPER.addChild(a)
    }
    this.animateIn = function() {
        if (c) {
            c = c.destroy()
        }
        c = d.initClass(SceneLive)
    };
    this.animateOut = function() {
        if (c) {
            c = c.destroy()
        }
    }
}, "Singleton");
Class(function DataGrid() {
    Inherit(this, Controller);
    var s = this;
    var q, u, e;
    var h, i, r;
    var y = null,
        g, m, b, o, t, z, w;
    var j = new Vector2();
    var f = new Vector2();
    j.y = t = 0;
    (function() {
        l();
        a();
        p();
        v()
    })();

    function l() {
        q = s.element;
        q.size("100%").css({
            top: Mobile.phone ? 49 : 59,
            borderTop: "1px solid #333"
        }).setZ(99).mouseEnabled(false).hide();
        u = q.create(".wrapper");
        u.size("100%").css({
            overflow: "hidden"
        });
        e = u.create("scroll");
        e.size("100%").setZ(1);
        r = s.initClass(ModuleTransition);
        i = s.initClass(DataExpand, q)
    }

    function a() {
        h = [];
        g = Config.DATAMODULES;
        for (var B = 0; B < g.length; B++) {
            var A = s.initClass(DataModule, g[B], B, null);
            A.events.add(HydraEvents.CLICK, c);
            e.add(A);
            h.push(A)
        }
    }

    function p() {
        s.events.subscribe(ContactEvents.RESIZE, v);
        __window.bind("keyup", n);
        s.events.subscribe(ContactEvents.DATA_CLOSE, k);
        i.events.add(HydraEvents.COMPLETE, k)
    }

    function v() {
        m = Math.ceil(Stage.width / 480);
        if (m > 4) {
            m = 4
        }
        b = 12 / m;
        o = Stage.width / (m * 480);
        if (h) {
            var B = -1,
                D = 0;
            for (var C = 0; C < h.length; C++) {
                var A = h[C];
                A.position(B, D);
                w = A.resize(o);
                if (B + w.width > Stage.width) {
                    B = -1;
                    D += w.height
                } else {
                    B += w.width
                }
            }
            z = (b - 1) * w.height;
            if (r && y !== null) {
                r.update(h[y]._x, h[y]._y, w)
            }
        }
    }

    function d(A) {
        t += -A;
        if (t < -z + (Stage.height - 70)) {
            t = -z + (Stage.height - 70)
        }
        if (t > 0) {
            t = 0
        }
        j.y = t
    }

    function n(A) {
        if (A.keyCode == 27) {
            k()
        }
    }

    function k() {
        if (r.expanded) {
            u.show();
            i.animateOut();
            r.collapse();
            if (!Device.mobile) {
                Render.startRender(x);
                ScrollUtil.link(d)
            } else {
                Mobile.overflowScroll(u, false, true)
            }
            y = null
        }
    }

    function c(B) {
        Render.stopRender(x);
        ScrollUtil.unlink(d);
        var A = B.index;
        h[A].element.setZ(100);
        r.expand(h[A]._x, h[A]._y + t, w);
        y = A;
        s.delayedCall(i.animateIn, 300, A);
        s.delayedCall(function() {
            u.hide()
        }, 1000)
    }

    function x() {
        f.lerp(j, 0.15);
        e.y = f.y;
        e.transform()
    }
    this.animateIn = function() {
        Tooltips.instance().footerCursor("over");
        if (!Device.mobile) {
            Render.startRender(x);
            ScrollUtil.link(d)
        } else {
            Mobile.overflowScroll(u, false, true)
        }
        q.mouseEnabled(true).show();
        for (var B = 0; B < m; B++) {
            for (var A = 0; A < b; A++) {
                if (h[B + m * A]) {
                    h[B + m * A].reset();
                    s.delayedCall(h[B + m * A].animateIn, (100 * A) + B * 50)
                }
            }
        }
        s.delayedCall(function() {
            if (Global.INNER_DEEPLINK) {
                for (var C = 0; C < g.length; C++) {
                    if (g[C].perma == Global.INNER_DEEPLINK) {
                        c({
                            index: C
                        })
                    }
                }
                Global.INNER_DEEPLINK = false
            }
        }, 800)
    };
    this.animateOut = function() {
        if (r.expanded) {
            i.animateOut();
            r.collapse();
            y = null;
            A()
        } else {
            A()
        }

        function A() {
            Render.stopRender(x);
            ScrollUtil.unlink(d);
            q.mouseEnabled(false);
            s.delayedCall(function() {
                t = 0;
                q.hide();
                for (var C = 0; C < m; C++) {
                    for (var B = 0; B < b; B++) {
                        h[C + m * B].reset()
                    }
                }
            }, Stage.height * 0.6 + 100)
        }
    }
});
Class(function Container() {
    Inherit(this, Controller);
    var x = this;
    var w, G, n, F;
    var k, j, H, m, h, c, i, z;
    var C, g;
    (function() {
        y();
        f();
        l();
        o();
        E();
        q();
        A();
        Tooltips.instance().cursor(false)
    })();

    function y() {
        w = x.container;
        w.size("100%").bg("#000").setZ(1);
        Stage.add(w);
        Stage.css({
            overflow: "hidden"
        });
        if (Config.RECORD_MOBILE) {
            Stage.css({
                cursor: "none"
            })
        }
    }

    function f() {
        G = w.create(".top");
        G.size("100%").setZ(1);
        Global.SCENE_WRAPPER = G;
        n = w.create(".bottom");
        n.size("100%").css({
            marginTop: Mobile.phone ? -50 : -40,
            top: "100%"
        }).transform({
            y: Mobile.phone ? 54 : 44
        }).setZ(2).bg("#000").invisible();
        n.up = false
    }

    function l() {
        var I = Global.INIT_MOMENT && !Device.mobile;
        if (I) {
            return
        }
        z = x.initClass(ChromeLogo, null);
        Stage.addChild(z);
        h = x.initClass(IntroView, null);
        G.addChild(h)
    }

    function o() {
        var I = window.location.hash;
        if (I.strpos("playground")) {
            x.initClass(Playground)
        } else {
            if (ContactDevice.WEBGL) {
                k = x.initClass(Scene, null);
                G.addChild(k)
            } else {
                g = x.initClass(SceneVideo, null);
                G.add(g)
            }
            i = x.initClass(Titles, null);
            G.addChild(i)
        }
    }

    function E() {
        H = x.initClass(Footer, null);
        if (!Config.RECORD_MOBILE) {
            n.addChild(H)
        }
        m = x.initClass(Timeline, null);
        if (!Config.RECORD_MOBILE) {
            n.addChild(m)
        }
        if (Device.mobile && !ContactDevice.IPHONE) {
            j = x.initClass(HamburgerButton, null);
            G.addChild(j)
        }
    }

    function s(I) {
        if (z) {
            z.animateOut(function() {
                z = z.destroy();
                if (h && h.destroy) {
                    h = h.destroy()
                }
            })
        }
        if (j) {
            x.delayedCall(j.animateIn, 500)
        }
        H.resize(Mobile.phone ? 50 : 40);
        n.visible().tween({
            y: I.live || ContactDevice.IPHONE ? 0 : Mobile.phone ? 50 : 40
        }, Mobile.phone ? 500 : 800, "easeInOutQuart");
        if (H) {
            x.delayedCall(H.animateIn, 200)
        }
        if (m) {
            x.delayedCall(m.animateIn, 2500)
        }
        x.delayedCall(function() {
            x.visible = true
        }, Mobile.phone ? 300 : 3000)
    }

    function r(I, J) {
        if (!x.up) {
            return
        }
        x.up = Global.WRAPPER_UP = false;
        if (!Mobile.phone) {
            H.down()
        }
        if (j) {
            x.delayedCall(j.animateIn, 300)
        }
        G.tween({
            y: 0
        }, Mobile.phone ? 600 : 700, "easeInOutCubic");
        n.tween({
            y: I || ContactDevice.IPHONE ? 0 : Mobile.phone ? 50 : 40
        }, Mobile.phone ? 600 : 700, "easeInOutCubic", function() {
            if (J) {
                J()
            }
            n.setZ(1000000);
            x.peaking = Global.NAV_OPEN = false;
            if (c) {
                c = c.destroy()
            }
        })
    }

    function v() {
        if (x.up) {
            return
        }
        x.up = Global.WRAPPER_UP = true;
        Sound.stopAll();
        x.events.fire(ContactEvents.PLAY_PAUSE, {
            play: false
        });
        if (!Mobile.phone) {
            H.up()
        }
        if (C) {
            clearTimeout(C)
        }
        if (!Mobile.phone) {
            m.down()
        }
        n.setZ(1000000 + 500);
        Tooltips.instance().footerCursor("over");
        G.tween({
            y: -Stage.height * 0.5
        }, Mobile.phone ? 600 : 800, "easeInOutCubic");
        n.tween({
            y: -Stage.height + (Mobile.phone ? 50 : 40)
        }, Mobile.phone ? 600 : 800, "easeInOutCubic")
    }

    function D(K) {
        if (c && K == c.type) {
            return
        }
        var J;
        switch (K) {
            case "data":
                J = x.initClass(DataGrid, null);
                break;
            case "about":
                J = x.initClass(About, null);
                break
        }

        function I() {
            if (c) {
                c = c.destroy()
            }
            c = J;
            c.type = K;
            c.container.setZ(98)
        }
        if (J) {
            J.container.setZ(99);
            n.addChild(J);
            if (J.animateIn) {
                x.delayedCall(J.animateIn, 300, c ? 0 : 300)
            }
            if (c) {
                c.container.transformPoint("50%", "0%").stopTween().tween({
                    scale: 0.96,
                    opacity: 0
                }, 500, "easeOutSine");
                J.container.stopTween().transform({
                    y: Stage.height
                }).tween({
                    y: 0
                }, 500, "easeInCubic", I)
            } else {
                I()
            }
        }
    }

    function q() {
        x.events.subscribe(ContactEvents.RESIZE, A);
        x.events.subscribe(ContactEvents.BEGIN, s);
        x.events.subscribe(ContactEvents.NAV_CLICK, p);
        x.events.subscribe(ContactEvents.HOMEPAGE, u);
        if (Device.mobile) {
            if (!ContactDevice.IPHONE) {
                __window.bind("touchstart", t);
                j.events.add(HydraEvents.CLICK, B)
            }
        } else {
            __window.bind("mousemove", b)
        }
    }

    function u() {
        x.up = x.peaking = x.visible = Global.FULL_PEEL = false;
        Global.NAV_OPEN = Global.NOT_ON_JOURNEY = Global.INNER_DEEPLINK = Global.WRAPPER_UP = false;
        l();
        if (j) {
            j.animateOut()
        }
        m.container.tween({
            opacity: 0
        }, 400, "easeOutSine", function() {
            if (m) {
                m = m.destroy()
            }
            m = x.initClass(Timeline, null);
            if (!Config.RECORD_MOBILE) {
                n.addChild(m)
            }
            x.delayedCall(x.animateIn, 1000)
        });
        G.tween({
            y: 0
        }, Mobile.phone ? 600 : 800, "easeInOutCubic");
        n.tween({
            y: Mobile.phone ? 54 : 44
        }, Mobile.phone ? 600 : 800, "easeInOutCubic")
    }

    function A() {
        if (x.up) {
            n.transform({
                y: -Stage.height + (Mobile.phone ? 50 : 40)
            })
        }
    }

    function p(I) {
        if (I.restart) {
            return
        }
        Global.NOT_ON_JOURNEY = true;
        if (Global.PLAYPAUSE_ICON) {
            Global.PLAYPAUSE_ICON.hide()
        }
        switch (I.type) {
            case "journey":
                x.disabled = false;
                m.up();
                m.element.tween({
                    opacity: 1
                }, 200, "easeOutSine");
                x.delayedCall(function() {
                    Global.NOT_ON_JOURNEY = false;
                    if (Global.PLAYPAUSE_ICON) {
                        Global.PLAYPAUSE_ICON.show()
                    }
                }, 1000);
                r(false, function() {
                    if (Mobile.phone) {
                        H.backToJourney()
                    }
                    x.events.fire(ContactEvents.PLAY_PAUSE, {
                        play: true
                    })
                });
                GATracker.trackEvent("clickable_link", "landing_page", "journey");
                break;
            case "live":
                x.events.fire(ContactEvents.PLAY_PAUSE, {
                    play: false
                });
                if (!Mobile.phone) {
                    x.disabled = true;
                    m.down();
                    m.element.tween({
                        opacity: 0
                    }, 400, "easeOutSine", 300);
                    n.stopTween().tween({
                        y: 0
                    }, 500, "easeInOutCubic")
                }
                r(true);
                GATracker.trackEvent("clickable_link", "landing_page", "journey");
                break;
            default:
                if (I.type == "about" || I.type == "data") {
                    Global.STATE_MODEL.replaceState(I.type)
                }
                D(I.type);
                v();
                break
        }
    }

    function a() {
        if (x.up || x.peaking || x.disabled || !x.visible) {
            return
        }
        if (C) {
            clearTimeout(C)
        }
        B()
    }

    function d() {
        if (x.up || !x.peaking || x.disabled || !x.visible) {
            return
        }
        if (!C) {
            C = setTimeout(e, 1000)
        }
    }

    function B() {
        x.peaking = true;
        x.disabled = true;
        x.delayedCall(function() {
            x.disabled = false
        }, 500);
        Tooltips.instance().footerCursor("over");
        Global.NAV_OPEN = true;
        n.stopTween().tween({
            y: 0
        }, 500, "easeInOutCubic");
        if (!Mobile.phone) {
            m.up()
        }
        if (j) {
            j.animateOut()
        }
    }

    function e() {
        x.peaking = false;
        x.disabled = true;
        x.delayedCall(function() {
            x.disabled = false;
            Global.NAV_OPEN = false
        }, 500);
        Tooltips.instance().footerCursor("out");
        if (!Mobile.phone) {
            m.down()
        }
        if (j) {
            x.delayedCall(j.animateIn, 200)
        }
        C = null;
        n.stopTween().tween({
            y: Mobile.phone ? 50 : 40
        }, Mobile.phone ? 600 : 700, "easeInOutCubic")
    }

    function b() {
        if (!x.visible) {
            return
        }
        var I = x.peaking || Device.mobile ? 110 : 40;
        if (Mouse.y > Stage.height - I) {
            a()
        } else {
            d()
        }
    }

    function t() {
        if (x.up || !x.peaking || x.disabled || !x.visible) {
            return
        }
        var I = Mobile.phone ? 60 : 120;
        if (Mouse.y < Stage.height - I) {
            e()
        }
    }
    this.animateIn = function() {
        if (h) {
            h.animateIn()
        }
        if (z) {
            x.delayedCall(z.animateIn, 200)
        }
    }
}, "Singleton");
Class(function DeviceError() {
    Inherit(this, Controller);
    var e = this;
    var i, b, h, f;
    var d, j;
    (function() {
        c();
        g();
        a()
    })();

    function c() {
        i = e.container;
        i.size("100%").setZ(100000000000).hide().css({
            opacity: 0
        });
        Stage.addChild(i);
        b = i.create(".bg");
        b.size("100%").bg(Config.IMAGES + "error/bg.png", "50%", "50%");
        h = i.create(".glow");
        h.size(900, 900).bg(Config.IMAGES + "error/glow.png").center();
        f = i.create(".wrapper");
        f.size(600, 750).center()
    }

    function g() {
        e.events.subscribe(HydraEvents.RESIZE, a)
    }

    function a() {
        f.scale = Stage.height < 900 ? Stage.height / 900 : 1;
        if (Stage.width < 600) {
            var k = Stage.width / 600;
            if (k < f.scale) {
                f.scale = k
            }
        }
        f.transform()
    }
    this.show = function(l, m) {
        e.visible = true;
        j = null;
        j = m || null;
        a();
        i.show().tween({
            opacity: 1
        }, 300, "easeOutSine", a);
        var k = "ErrorBasic";
        switch (l) {
            case "rotate":
                k = "ErrorLandscape";
                break;
            case "webgl":
                k = "ErrorWebgl";
                break;
            case "chrome":
                k = "ErrorChrome";
                break
        }
        if (d) {
            d = d.destroy()
        }
        d = e.initClass(window[k], null);
        d.type = l;
        f.addChild(d)
    };
    this.hide = function() {
        e.visible = false;
        if (d && d.type !== "rotate" && !Device.mobile) {
            i.tween({
                opacity: 0
            }, 500, "easeOutSine", k)
        } else {
            k()
        }

        function k() {
            e.delayedCall(function() {
                if (!e.visible) {
                    i.hide().css({
                        opacity: 0
                    })
                }
            }, 200);
            if (d && d.destroy) {
                d = d.destroy()
            }
            if (j) {
                j()
            }
        }
    }
}, "Singleton");
Class(function Elements() {
    Inherit(this, Controller);
    var h = this;
    var e;
    var c = new LinkedList();
    (function() {
        Global.ELEMENTS = h;
        Render.startRender(d);
        i()
    })();

    function f() {
        h.space = b(SpaceElement);
        h.sun = b(SunElement);
        h.earth = b(EarthElement);
        h.satellite = b(SatelliteElement);
        h.trajectoryAll = b(TrajectoryElement, "satellite_all", ContactDevice.PREVENT_3D);
        if (!ContactDevice.PREVENT_3D) {
            h.trajectorySmooth = b(TrajectoryElement, "satellite_smooth");
            h.dot = b(DotElement);
            h.moon = b(MoonElement);
            h.comet = b(CometElement);
            h.satelliteSmall = b(SatelliteElement, true);
            h.title1 = b(TitleElement, "title1.png", 1024, 146);
            h.title2 = b(TitleElement, "title2.png", 1069, 108);
            h.title3 = b(TitleElement, "title3.png", 1171, 108);
            h.title4 = b(TitleElement, "title4.png", 752, 108);
            h.title5 = b(TitleElement, "title5.png", 922, 108)
        }
    }

    function b(j, r, q, p, o, n, m, l) {
        var k = h.initClass(j, r, q, p, o, n, m, l);
        c.push(k);
        return k
    }

    function a(k) {
        var j = c.start();
        while (j) {
            if (j.render) {
                j.render(k)
            }
            j = c.next()
        }
    }

    function d(k) {
        var j = c.start();
        while (j) {
            if (j.update) {
                j.update(k)
            }
            j = c.next()
        }
    }

    function i() {
        h.events.subscribe(ContactEvents.RESET_3D, g)
    }

    function g() {
        for (var j in h) {
            var k = h[j];
            if (k.hide) {
                k.hide()
            }
        }
    }
    this.set("scene", function(j) {
        e = j;
        c.push(j);
        f()
    });
    this.get("scene", function() {
        return e.scene
    });
    this.hideAll = function(j) {
        if (!j) {
            h.initClass(h.hideAll, 100, true)
        }
        var k = c.start();
        while (k) {
            if (k.hide) {
                k.hide()
            }
            k = c.next()
        }
        Tooltips.instance().reset();
        Global.SCENE_VIEW.show();
        Data.CAMERA.resetPlanes();
        if (Global.ELEMENTS.video) {
            Global.ELEMENTS.video.setOpacity(0)
        }
    };
    this.loadLive = function(j) {
        if (!Hydra.JSON.moon || !Hydra.JSON.satellite_future || !Global.MOON_LOADED) {
            return h.delayedCall(h.loadLive, 10, j)
        }
        Data.TRAJECTORY.initTrajectories();
        h.trajectoryMoon = b(TrajectoryElement, "moon");
        h.trajectoryFuture = b(TrajectoryElement, "satellite_future");
        if (!h.satelliteSmall) {
            h.satelliteSmall = b(SatelliteElement, true)
        }
        if (!h.moon) {
            h.moon = b(MoonElement)
        }
        if (!h.dot) {
            h.dot = b(DotElement)
        }
        if (j) {
            j()
        }
    }
}, "Singleton");
Class(function AboutView() {
    Inherit(this, View);
    var o = this;
    var h, e, p, k;
    var b, a;
    var c = [];
    var j = new Vector2();
    j.y = 0;
    var f = new Vector2();
    var g = Data.ABOUT.getCopy();
    Global.ABOUT_SCALE = Mobile.phone ? 0.75 : 1;
    (function() {
        l();
        if (!Device.mobile) {
            q()
        }
        n();
        i();
        s();
        m();
        r()
    })();

    function l() {
        h = o.element;
        h.size("100%").bg(Config.IMAGES + "colors/000.png").css({
            overflow: "hidden",
            paddingBottom: 50
        });
        e = h.create(".scroll");
        e.css({
            position: "relative",
            display: "block",
            width: "100%"
        }).setZ(2).invisible()
    }

    function n() {
        var u = o.initClass(AboutParagraph, {
            title: g.section_1_title,
            copy: g.section_1_copy
        }, null);
        e.addChild(u);
        c.push(u)
    }

    function i() {
        b = o.initClass(AboutSlider, null);
        e.addChild(b)
    }

    function s() {
        var x = o.initClass(AboutParagraph, {
            title: g.section_2_title,
            copy: g.section_2_copy
        }, null);
        x.css({
            marginBottom: 150
        });
        e.addChild(x);
        c.push(x);
        var u = o.initClass(AboutTechnology, g, null);
        e.addChild(u);
        c.push(u);
        var w = o.initClass(AboutParagraph, {
            title: g.section_4_title,
            copy: g.section_4_copy
        }, null);
        e.addChild(w);
        c.push(w);
        var v = o.initClass(AboutSources, g.sources, null);
        e.addChild(v);
        c.push(v.element);
        var x = o.initClass(AboutParagraph, {
            title: "CREDITS"
        }, null);
        x.css({
            marginBottom: 50
        });
        e.addChild(x);
        c.push(x);
        a = o.initClass(AboutLogos, null);
        e.addChild(a);
        a.element.addExtra = true;
        c.push(a.element)
    }

    function q() {
        p = h.create(".diagram");
        p.size(454, 834).css({
            left: "50%",
            marginLeft: -980,
            top: 0
        }).bg(Config.IMAGES + "about/diagram-left.png").setZ(1);
        k = h.create(".diagram");
        k.size(984, 897).css({
            left: "50%",
            marginLeft: 300,
            top: 0
        }).bg(Config.IMAGES + "about/diagram-right.png").setZ(1)
    }

    function t() {
        f.lerp(j, Global.SCROLL_LERP);
        e.y = f.y;
        e.transform();
        if (p) {
            p.y = 1900 + f.y * 0.65;
            p.transform();
            k.y = 1500 + f.y * 0.8;
            k.transform()
        }
    }

    function m() {
        o.events.subscribe(ContactEvents.RESIZE, r);
        if (!Device.mobile) {
            Render.startRender(t);
            ScrollUtil.link(d)
        } else {
            Mobile.overflowScroll(h, false, true)
        }
    }

    function d(v) {
        o.height = e.div.offsetHeight + 200;
        h.div.style.height = o.height + "px";
        j.y += -v;
        var u = -o.height + (Stage.height);
        if (j.y < u) {
            j.y = u
        }
        if (j.y > 0) {
            j.y = 0
        }
    }

    function r() {
        b.resize();
        var w = Stage.width < 950;
        var y = w ? 40 : "45%";
        var v = w ? Stage.width - 80 : 640;
        var x = w ? 0 : -v / 2;
        a.resize(w);
        for (var u = 0; u < c.length; u++) {
            if (c[u].keepWidth) {
                c[u].css({
                    left: y,
                    marginLeft: x
                })
            }
            if (c[u].addExtra) {
                c[u].css({
                    left: y,
                    width: v + 40,
                    marginLeft: x
                })
            } else {
                c[u].css({
                    left: y,
                    width: v,
                    marginLeft: x
                })
            }
        }
    }
    this.animateIn = function(u) {
        r();
        Render.nextFrame(r);
        e.visible();
        c[0].animateIn(u);
        b.element.css({
            opacity: 0
        }).transform({
            y: 80
        }).tween({
            opacity: 1,
            y: 0
        }, 800, "easeOutQuart", u + 500)
    };
    this.destroy = function() {
        Render.stopRender(t);
        ScrollUtil.unlink(d);
        return o._destroy()
    }
});
Class(function AboutLogos() {
    Inherit(this, View);
    var h = this;
    var g;
    var a;
    (function() {
        d();
        f();
        c()
    })();

    function d() {
        g = h.element;
        g.css({
            position: "relative",
            display: "block",
            paddingBottom: 140
        })
    }

    function f() {
        var l = [{
            image: "space-college.png",
            width: 198 * 0.5,
            height: 110 * 0.5,
            left: 65,
            right: 60,
            link: "http://spacecollege.org"
        }, {
            image: "skycorp.png",
            width: 318 * 0.5,
            height: 24 * 0.5,
            right: 30,
            link: "http://www.skycorpinc.com"
        }, {
            image: "spaceref.png",
            width: 268 * 0.5,
            height: 54 * 0.5,
            link: "http://spaceref.com/"
        }, {
            image: "active-theory.png",
            width: 442 * 0.5,
            height: 26 * 0.5,
            link: "http://activetheory.net"
        }, {
            image: "flies-collective.png",
            width: 348 * 0.5,
            left: 2,
            height: 190 * 0.5,
            link: "http://www.fliescollective.com/"
        }, {
            image: "stockton-stockton.png",
            width: 324 * 0.5,
            left: 2,
            height: 54 * 0.5,
            link: "http://www.illop.com/"
        }, {
            image: "reuter.png",
            width: 138 * 0.5,
            height: 138 * 0.5,
            link: "http://editbar.com/"
        }, {
            image: "sound-lounge.png",
            width: 172 * 0.5,
            left: 20,
            height: 90 * 0.5,
            link: "http://www.soundlounge.com/"
        }, {
            image: "nice-shoes.png",
            width: 290 * 0.5,
            left: 20,
            height: 56 * 0.5,
            link: "http://www.niceshoes.com/"
        }, {
            image: "made-with.png",
            width: 180,
            left: 15,
            height: 40,
            link: "http://www.google.com/"
        }];
        a = [];
        for (var k = 0; k < l.length; k++) {
            var j = g.create(".logo", "a");
            j.size(l[k].width * Global.ABOUT_SCALE, 95 * Global.ABOUT_SCALE);
            j.link = l[k].link;
            j.inner = j.create("image");
            j.inner.size(l[k].width * Global.ABOUT_SCALE, l[k].height * Global.ABOUT_SCALE).bg(Config.IMAGES + "about/logos/" + l[k].image).center();
            j.left = l[k].left || 0;
            j.right = l[k].right || 0;
            j.css({
                position: "relative",
                display: "inline-block",
                opacity: 0.75,
                marginLeft: j.left,
                marginRight: 32 + j.right
            });
            a.push(j)
        }
    }

    function c() {
        for (var j = 0; j < a.length; j++) {
            a[j].interact(b, e)
        }
    }

    function b(i) {
        switch (i.action) {
            case "over":
                i.object.tween({
                    opacity: 1
                }, 100, "easeOutSine");
                break;
            case "out":
                i.object.tween({
                    opacity: 0.75
                }, 300, "easeOutSine");
                break
        }
    }

    function e(j) {
        var i = j.object.link;
        b({
            object: j.object,
            action: "out"
        });
        getURL(i, "_blank")
    }
    this.resize = function(k) {
        for (var j = 0; j < a.length; j++) {
            if (!k) {
                a[j].css({
                    marginLeft: a[j].left,
                    marginRight: 32 + a[j].right
                })
            } else {
                a[j].css({
                    marginLeft: 0,
                    marginRight: 32
                })
            }
        }
    }
});
Class(function AboutParagraph(c) {
    Inherit(this, View);
    var h = this;
    var g, e, f, d;
    (function() {
        b();
        a()
    })();

    function b() {
        g = h.element;
        g.css({
            position: "relative",
            display: "block"
        })
    }

    function a() {
        e = g.create(".title");
        e.fontStyle("Tungsten", 68 * Global.ABOUT_SCALE, "#fff");
        e.css({
            letterSpacing: 10 * Global.ABOUT_SCALE,
            lineHeight: 68 * Global.ABOUT_SCALE,
            marginTop: 80 * Global.ABOUT_SCALE,
            marginBottom: 30 * Global.ABOUT_SCALE,
            position: "relative",
            display: "block",
            textTransform: "uppercase"
        });
        e.html(c.title);
        f = g.create(".line");
        f.size("100%", 4).css({
            marginBottom: 30 * Global.ABOUT_SCALE,
            position: "relative",
            display: "block"
        }).bg("#fff");
        if (c.copy) {
            d = g.create(".copy");
            d.fontStyle("GravurCondensed", 18 * Global.ABOUT_SCALE, "#fff");
            d.css({
                lineHeight: 30 * Global.ABOUT_SCALE,
                letterSpacing: 0.1,
                marginBottom: 100 * Global.ABOUT_SCALE,
                position: "relative",
                display: "block"
            });
            d.html(c.copy)
        }
    }
    this.animateIn = function(i) {
        e.transform({
            y: 50
        }).css({
            opacity: 0
        }).tween({
            opacity: 1,
            y: 0
        }, 600, "easeOutCubic", i + 200);
        f.css({
            width: "0%",
            opacity: 0
        }).transform({
            y: 50
        }).tween({
            y: 0,
            width: "100%",
            opacity: 1
        }, 600, "easeOutCubic", i + 300);
        if (d) {
            d.transform({
                y: 50
            }).css({
                opacity: 0
            }).tween({
                opacity: 1,
                y: 0
            }, 800, "easeOutCubic", i + 400)
        }
    }
});
Class(function AboutSources(k) {
    Inherit(this, View);
    var e = this;
    var h, f, a, j, l;
    var i = 0;
    (function() {
        c();
        b();
        g()
    })();

    function c() {
        h = e.element;
        h.css({
            position: "relative",
            display: "block",
            height: 105 * Global.ABOUT_SCALE,
            marginBottom: 120 * Global.ABOUT_SCALE,
            overflow: "hidden"
        });
        var n = h.create(".title");
        n.fontStyle("Tungsten", 68 * Global.ABOUT_SCALE, "#fff");
        n.css({
            letterSpacing: 10 * Global.ABOUT_SCALE,
            lineHeight: 68 * Global.ABOUT_SCALE,
            marginBottom: 30 * Global.ABOUT_SCALE,
            position: "relative",
            display: "block"
        });
        n.html("SOURCES");
        var o = h.create(".line");
        o.size("100%", 4).css({
            marginBottom: 40 * Global.ABOUT_SCALE,
            position: "relative",
            display: "block"
        }).bg("#fff");
        j = h.create(".arrow");
        j.size(32 * Global.ABOUT_SCALE, 24 * Global.ABOUT_SCALE).css({
            right: 0,
            top: 30 * Global.ABOUT_SCALE,
            opacity: 0.6,
            webkitBackfaceVisibility: "visible"
        }).bg(Config.IMAGES + "about/arrow.png").transform({
            rotationX: 180
        });
        f = h.create(".wrapper");
        f.css({
            position: "relative",
            display: "block"
        })
    }

    function b() {
        a = f.create(".left");
        a.css({
            width: "45%",
            position: "relative",
            display: "inline-block",
            height: "100%",
            verticalAlign: "top"
        });
        l = f.create(".right");
        l.css({
            marginLeft: "10%",
            width: "45%",
            position: "relative",
            display: "inline-block",
            height: "100%",
            verticalAlign: "top"
        });
        var q = 0;
        for (var o in k) {
            var r = k[o].match(/<br/g).length;
            i = Math.max(i, r);
            var p = l;
            if (q % 2 == 0) {
                p = a
            }
            var n = p.create(".copy");
            n.fontStyle("GravurCondensed", 18 * Global.ABOUT_SCALE, "#fff");
            n.css({
                lineHeight: 30 * Global.ABOUT_SCALE,
                letterSpacing: 0.1,
                marginBottom: 50 * Global.ABOUT_SCALE,
                position: "relative",
                display: "block"
            });
            n.html(k[o]);
            q++
        }
    }

    function g() {
        h.interact(d, m);
        h.hit.css({
            height: 105 * Global.ABOUT_SCALE
        }).transform({
            z: 1
        })
    }

    function d(n) {
        switch (n.action) {
            case "over":
                j.tween({
                    opacity: 1
                }, 300, "easeOutSine");
                break;
            case "out":
                j.tween({
                    opacity: 0.6
                }, 300, "easeOutSine");
                break
        }
    }

    function m(n) {
        if (e.open) {
            e.open = false;
            h.tween({
                height: 105 * Global.ABOUT_SCALE
            }, 500, "easeInOutCubic");
            j.tween({
                rotationX: 180
            }, 500, "easeInOutCubic");
            a.tween({
                opacity: 0,
                y: 10
            }, 300, "easeInSine");
            l.tween({
                opacity: 0,
                y: 10
            }, 300, "easeInSine")
        } else {
            e.open = true;
            h.tween({
                height: f.div.offsetHeight + 105 * Global.ABOUT_SCALE
            }, 500, "easeInOutCubic");
            j.tween({
                rotationX: 0
            }, 500, "easeInOutCubic");
            a.transform({
                y: 20
            }).css({
                opacity: 0
            }).tween({
                opacity: 1,
                y: 0
            }, 600, "easeOutCubic", 300);
            l.transform({
                y: 20
            }).css({
                opacity: 0
            }).tween({
                opacity: 1,
                y: 0
            }, 600, "easeOutCubic", 350)
        }
    }
    this.animateIn = function() {}
});
Class(function AboutTechnology(g) {
    Inherit(this, View);
    var h = this;
    var f, b, a;
    (function() {
        c();
        d();
        e()
    })();

    function c() {
        f = h.element;
        f.css({
            position: "relative",
            display: "block"
        })
    }

    function d() {
        var i = f.create(".title");
        i.fontStyle("Tungsten", 68 * Global.ABOUT_SCALE, "#fff");
        i.css({
            letterSpacing: 10,
            lineHeight: 68 * Global.ABOUT_SCALE,
            marginTop: 80 * Global.ABOUT_SCALE,
            marginBottom: 30 * Global.ABOUT_SCALE,
            position: "relative",
            display: "block"
        });
        i.html(g.section_3_title.toUpperCase());
        var j = f.create(".line");
        j.size("100%", 4).css({
            marginBottom: 40 * Global.ABOUT_SCALE,
            position: "relative",
            display: "block"
        }).bg("#fff")
    }

    function e() {
        b = f.create(".left");
        b.css({
            width: "45%",
            position: "relative",
            display: "inline-block",
            height: "100%",
            verticalAlign: "top"
        });
        a = f.create(".right");
        a.css({
            marginLeft: "10%",
            width: "45%",
            position: "relative",
            display: "inline-block",
            height: "100%",
            verticalAlign: "top"
        });
        for (var l = 0; l < g.tech.length; l++) {
            var k = l % 2 == 0 ? b : a;
            var j = k.create(".icon");
            j.size(180 * Global.ABOUT_SCALE, 160 * Global.ABOUT_SCALE).css({
                position: "relative",
                display: "block",
                marginBottom: 30 * Global.ABOUT_SCALE
            }).bg(Config.IMAGES + "about/icons/" + g.tech[l].perma + ".png");
            var n = k.create(".title");
            n.fontStyle("GravurCondensed", 26 * Global.ABOUT_SCALE, "#fff");
            n.css({
                position: "relative",
                display: "block",
                fontWeight: "bold",
                letterSpacing: 1,
                marginBottom: 5
            });
            n.html(g.tech[l].title.toUpperCase());
            var m = k.create(".copy");
            m.fontStyle("GravurCondensed", 18 * Global.ABOUT_SCALE, "#fff");
            m.css({
                position: "relative",
                display: "block",
                letterSpacing: 0.1,
                marginBottom: 70 * Global.ABOUT_SCALE,
                lineHeight: 30 * Global.ABOUT_SCALE
            });
            m.html(g.tech[l].copy)
        }
    }
    this.animateIn = function() {}
});
Class(function AboutArrow() {
    Inherit(this, View);
    var d = this;
    var g, j, a, e;
    d.height = 200;
    (function() {
        b();
        h();
        f()
    })();

    function b() {
        g = d.element;
        g.size(90, d.height).center(0, 1).setZ(10)
    }

    function h() {
        j = g.create(".lines");
        j.size("100%").css({
            opacity: 0.6
        });
        a = j.create(".top");
        a.size(6, d.height / 2).bg("#fff").transform({
            rotation: 45
        });
        a.transformPoint("0%", "100%");
        e = j.create(".bottom");
        e.size(6, d.height / 2).bg("#fff").css({
            bottom: 0
        }).transform({
            rotation: -45
        });
        e.transformPoint("0%", "0%")
    }

    function f() {
        g.interact(c, i);
        g.hit.size(Mobile.phone ? 200 : 500, 300).center(1)
    }

    function c(k) {
        switch (k.action) {
            case "over":
                j.stopTween().transform({
                    x: 0
                }).tween({
                    x: -15,
                    opacity: 0.9
                }, 200, "easeOutCubic");
                a.stopTween().transform({
                    rotation: 45
                }).tween({
                    rotation: 35
                }, 200, "easeOutCubic");
                e.stopTween().transform({
                    rotation: -45
                }).tween({
                    rotation: -35
                }, 200, "easeOutCubic");
                break;
            case "out":
                j.tween({
                    x: 0,
                    opacity: 0.6
                }, 400, "easeOutBack");
                a.tween({
                    rotation: 45
                }, 400, "easeOutBack");
                e.tween({
                    rotation: -45
                }, 400, "easeOutBack");
                break
        }
    }

    function i() {
        d.events.fire(HydraEvents.CLICK)
    }
    this.animateIn = function() {}
});
Class(function AboutSlider() {
    Inherit(this, View);
    var i = this;
    var m, f;
    var j, p, a;
    var o;
    (function() {
        g();
        c();
        l();
        n();
        k()
    })();

    function g() {
        m = i.element;
        m.size("100%").css({
            position: "relative",
            overflow: "hidden",
            marginBottom: 120,
            display: "block"
        });
        m.wrapper = m.create(".wrapper");
        m.wrapper.size("100%")
    }

    function c() {
        j = [];
        var q = ["The ISEE-3 undergoes testing and evaluation inside the Goddard Space Flight Centerâ€™s dynamic test chamber in 1976.", "The ISEE-3 Reboot Project team at their NASA Ames Research Center McMoon Headquarters.", "NASA scientist and orbit pioneer Bob Farquhar, seen holding his autobiography.", "In May of 2014, contact was made with ISEE-3 at Arecibo Observatory in Puerto Rico."];
        for (var r = 0; r < 4; r++) {
            var s = m.wrapper.create(".slide");
            s.caption = q[r];
            s.size("100%").bg(Config.IMAGES + "about/slides/" + r + ".jpg", "50%", "50%").css({
                backgroundSize: "cover"
            }).hide();
            j.push(s)
        }
        o = 0;
        j[o].show()
    }

    function l() {
        p = i.initClass(AboutArrow, null);
        m.wrapper.addChild(p);
        p.element.css({
            left: Mobile.phone ? "3%" : "5%"
        });
        a = i.initClass(AboutArrow, null);
        m.wrapper.addChild(a);
        a.element.transform({
            rotation: 180
        }).css({
            right: Mobile.phone ? "3%" : "5%"
        });
        if (Mobile.phone) {
            p.element.transform({
                scale: 0.6
            });
            a.element.transform({
                scale: 0.6,
                rotation: 180
            })
        }
    }

    function n() {
        f = m.create(".copy");
        f.fontStyle("GravurCondensed", Mobile.phone ? 14 : 18, "#fff");
        f.css({
            lineHeight: Mobile.phone ? 22 : 30,
            width: "92%",
            letterSpacing: 0.1,
            left: 20
        });
        f.html(j[o].caption)
    }

    function k() {
        p.events.add(HydraEvents.CLICK, b);
        a.events.add(HydraEvents.CLICK, h);
        __window.bind("keyup", d)
    }

    function b() {
        e(1)
    }

    function h() {
        e(-1)
    }

    function e(q) {
        if (i.animating) {
            return
        }
        var r = j[o];
        i.animating = true;
        m.mouseEnabled(false);
        i.delayedCall(function() {
            m.mouseEnabled(true);
            i.animating = false;
            r.hide().clearAlpha()
        }, 900);
        f.tween({
            y: 5,
            opacity: 0
        }, 200, "easeInSine");
        i.delayedCall(function() {
            f.stopTween().html(j[o].caption);
            f.css({
                opacity: 0
            }).transform({
                y: 10
            }).tween({
                y: 0,
                opacity: 1
            }, 500, "easeOutCubic")
        }, 500);
        r.setZ(1).tween({
            x: Stage.width * q * 0.25,
            opacity: 0.4
        }, 700, "easeInOutCubic");
        o += q;
        if (o < 0) {
            o = j.length - 1
        }
        if (o > j.length - 1) {
            o = 0
        }
        j[o].show().setZ(2).transform({
            x: -Stage.width * q
        }).tween({
            x: 0
        }, 700, "easeInOutCubic")
    }

    function d(r) {
        var q = r.keyCode;
        if (q == 39) {
            e(-1)
        }
        if (q == 37) {
            e(1)
        }
    }
    this.resize = function() {
        var r = 847 / 1920;
        var q = Stage.width * r;
        m.css({
            width: Stage.width,
            height: q + 50
        });
        m.wrapper.css({
            width: Stage.width,
            height: q
        });
        f.css({
            top: q + 10
        })
    };
    this.animateIn = function() {};
    this.destroy = function() {
        __window.unbind("keyup", d);
        return i._destroy()
    }
});
Class(function Camera(f, c) {
    Inherit(this, Component);
    var g = this;
    f = f || new THREE.Object3D();
    var e = new THREE.PerspectiveCamera();
    e.offsetX = 0;
    e.offsetY = 0;
    this.position = e.position;
    this.rotation = e.rotation;
    this.reference = e;
    this.parentCamera = f;
    this.reference.orbitDistance = 30;
    var b;
    (function() {
        d();
        Data.CAMERA.register(g.reference)
    })();

    function d() {
        e.free = c;
        if (!c) {
            f.add(e)
        }
    }

    function a(h) {
        if (b) {
            g.controls.update(h - b)
        }
        b = h;
        e.updateMatrixWorld()
    }
    this.initControls = function(h) {
        e.position.z = e.position.z || 1;
        e.updateMatrixWorld();
        Render.startRender(a);
        this.controls = new h(this.reference)
    };
    this.destroy = function() {
        e.destroyed = true;
        Render.stopRender(a);
        return this._destroy()
    };
    this.getState = function(h) {
        return this.reference.getState(h)
    };
    this.applyState = function(h) {
        this.reference.applyState(h)
    };
    this.forceFOV = function(h) {
        g.reference.fov = h;
        Data.CAMERA.fov = h
    };
    this.offsetX = function(h) {
        g.reference.offsetX = h
    };
    this.offsetY = function(h) {
        g.reference.offsetY = h
    };
    this.set("fov", function(h) {
        g.reference.fov = h
    });
    this.get("fov", function() {
        if (!g.reference) {
            return -1
        }
        return g.reference.fov
    });
    this.set("orbitDistance", function(h) {
        g.reference.orbitDistance = h
    });
    this.get("orbitDistance", function() {
        if (!g.reference) {
            return null
        }
        return g.reference.orbitDistance
    })
});
Class(function BufferingAnim() {
    Inherit(this, View);
    var h = this;
    var g, f;
    var e, b;
    h.size = 120;
    (function() {
        d();
        c();
        a()
    })();

    function d() {
        g = h.element;
        g.size(h.size, h.size).center().setZ(100).hide();
        g.wrapper = g.create(".wrapper");
        g.wrapper.size("100%");
        f = g.wrapper.create(".spin");
        f.size(h.size, h.size).bg(Config.IMAGES + "common/buffer.png")
    }

    function c() {
        e = h.initClass(CSSAnimation, f);
        e.duration = 2000;
        e.loop = true;
        e.frames = [{
            rotation: 0
        }, {
            rotation: 360
        }]
    }

    function a() {
        b = Stage.height < 500 ? Stage.height / 500 : 1
    }
    this.animateIn = function(i) {
        h.visible = true;
        a();
        g.show();
        e.play();
        g.wrapper.stopTween().css({
            opacity: 0
        }).transform({
            scale: b * 0.6
        }).tween({
            opacity: 1,
            scale: b
        }, i || 1000, "easeOutCubic")
    };
    this.animateOut = function() {
        h.visible = false;
        g.wrapper.stopTween().tween({
            opacity: 0,
            scale: b * 0.9
        }, 300, "easeOutCubic");
        h.delayedCall(function() {
            if (!h.visible) {
                g.hide();
                e.stop()
            }
        }, 400)
    }
});
Class(function ChromeLogo() {
    Inherit(this, View);
    var h = this;
    var g, b;
    (function() {
        e();
        d();
        a()
    })();

    function e() {
        g = h.element;
        g.size(120, 63).css({
            bottom: 23,
            left: 25,
            opacity: 0
        }).invisible().setZ(10000000000).transformPoint("0%", "100%");
        if (Mobile.phone) {
            g.css({
                left: 10,
                bottom: 5
            })
        }
        b = g.create(".logo");
        b.size(120, 63).css({
            opacity: 0.5
        }).bg(Config.IMAGES + "common/chrome.png")
    }

    function d() {
        g.interact(c, f);
        h.events.subscribe(ContactEvents.RESIZE, a)
    }

    function c(i) {
        switch (i.action) {
            case "over":
                b.tween({
                    opacity: 0.8
                }, 200, "easeOutSine");
                break;
            case "out":
                b.tween({
                    opacity: 0.5
                }, 200, "easeOutSine");
                break
        }
    }

    function f() {
        getURL("http://www.chromeexperiments.com/", "_blank");
        GATracker.trackEvent("clickable_link", "landing_page", "get_started")
    }

    function a() {
        var i = Mobile.phone ? 1200 : 900;
        g.scale = Stage.width < i ? Stage.width / i : 1;
        g.transform()
    }
    this.animateOut = function(i) {
        g.tween({
            opacity: 0
        }, 400, "easeOutSine", i)
    };
    this.animateIn = function() {
        g.hit.hide();
        g.visible().css({
            opacity: 0
        }).tween({
            opacity: 1
        }, 800, "easeOutSine")
    }
});
Class(function GhostButton(i) {
    Inherit(this, View);
    var f = this;
    var h, j, k;
    var b;
    this.disabled = true;
    f.width = i.width || 200;
    f.height = i.height || 40;
    f.text = i.text || "";
    f.lineWidth = Mobile.phone ? 2 : 3;
    f.fontSize = Math.round(f.height * 0.4);
    (function() {
        d();
        l();
        c();
        a();
        g()
    })();

    function d() {
        h = f.element;
        h.size(f.width, f.height).css({
            overflow: "hidden"
        }).invisible()
    }

    function l() {
        b = [];
        var n = h.create(".line");
        n.size(f.width - f.lineWidth + 1, f.lineWidth).css({
            top: 0,
            left: 1
        }).bg(Config.IMAGES + "colors/fff.png").transform({
            x: -f.width
        });
        b.push(n);
        var n = h.create(".line");
        n.size(f.width - f.lineWidth + 1, f.lineWidth).css({
            bottom: 0,
            left: 1
        }).bg(Config.IMAGES + "colors/fff.png").transform({
            y: -f.height
        });
        b.push(n);
        var n = h.create(".line");
        n.size(f.lineWidth, f.height).css({
            top: 0,
            left: 1
        }).bg(Config.IMAGES + "colors/fff.png").transform({
            y: -f.height
        });
        b.push(n);
        var n = h.create(".line");
        n.size(f.lineWidth, f.height).css({
            top: 0,
            right: 0
        }).bg(Config.IMAGES + "colors/fff.png").transform({
            y: -f.height
        });
        b.push(n)
    }

    function c() {
        j = h.create(".text");
        j.fontStyle("GravurCondensed", f.fontSize, "#fff");
        j.css({
            width: "100%",
            textAlign: "center",
            lineHeight: f.height,
            letterSpacing: 3,
            opacity: 0
        }).transform({
            y: -15
        });
        if (f.text.length == 1) {
            j.css({
                left: 2
            })
        }
        j.html(f.text.toUpperCase())
    }

    function a() {
        k = h.create(".active");
        k.size(f.width - 2, f.height - 2).bg(Config.IMAGES + "colors/fff.png").css({
            overflow: "hidden",
            left: 1,
            top: 1
        }).transform({
            y: -f.height - 2
        });
        k.inner = j.clone();
        k.addChild(k.inner);
        k.inner.css({
            color: "#6bd4be",
            fontWeight: "400"
        }).clearAlpha().clearTransform();
        var n = "#82b882, #82b882, #ffe800, #ff9900, #f06751, #6b9bba, #7970b1, #e673c0, #b6c2c6, #9bdacf, #8ee9d6, #82b882";
        k.inner.css({
            background: "-webkit-linear-gradient(left, " + n + ")",
            backgroundSize: "300% 100%",
            webkitBackgroundClip: "text",
            webkitTextFillColor: "transparent"
        });
        k.anim = f.initClass(CSSAnimation, k.inner);
        k.anim.duration = 5000;
        k.anim.loop = true;
        k.anim.frames = [{
            backgroundPosition: "0px 0px"
        }, {
            backgroundPosition: f.width * 3 + "px 0px"
        }];
        k.anim.play()
    }

    function g() {
        h.interact(e, m);
        h.hit.mouseEnabled(true).css({
            cursor: "default"
        })
    }

    function e(n) {
        if (!f.visible || f.disabled || f.active || Global.BUTTON_DISABLE) {
            return
        }
        switch (n.action) {
            case "over":
                h.hit.css({
                    cursor: "pointer"
                });
                f.over = true;
                f.dir = n.layerY > f.height ? -1 : 1;
                k.stopTween().transform({
                    y: -f.height * f.dir
                }).tween({
                    y: 0
                }, 300, "easeOutQuart");
                k.inner.stopTween().transform({
                    y: f.height * f.dir
                }).tween({
                    y: 0
                }, 300, "easeOutQuart");
                break;
            case "out":
                h.hit.css({
                    cursor: "default"
                });
                f.over = false;
                k.stopTween().transform({
                    y: 0
                }).tween({
                    y: f.height * f.dir
                }, 500, "easeOutQuart");
                k.inner.stopTween().transform({
                    y: 0
                }).tween({
                    y: -f.height * f.dir
                }, 500, "easeOutQuart");
                break
        }
    }

    function m() {
        if (!f.visible || f.active || Global.BUTTON_DISABLE) {
            return
        }
        f.events.fire(HydraEvents.CLICK, i)
    }
    this.disable = function() {
        f.disabled = true;
        h.tween({
            opacity: 0.25
        }, 200, "easeOutSine")
    };
    this.enable = function() {
        f.disabled = false;
        h.tween({
            opacity: 1
        }, 400, "easeOutSine")
    };
    this.activate = function() {
        if (!f.over) {
            e({
                action: "over"
            })
        }
        f.active = true
    };
    this.deactivate = function() {
        f.active = false;
        e({
            action: "out"
        })
    };
    this.animateIn = function() {
        f.visible = true;
        h.visible();
        k.transform({
            y: -f.height
        });
        j.show().css({
            opacity: 0
        }).transform({
            y: -15
        }).tween({
            y: 0,
            opacity: 1
        }, 300, "easeOutCubic", 450, g);
        b[0].show().transform({
            x: -f.width
        }).tween({
            x: 0
        }, 450, "easeInOutQuint");
        b[1].show().transform({
            y: -f.height - 1
        }).tween({
            y: 0
        }, 450, "easeOutQuart", 400);
        b[2].show().transform({
            y: -f.height - 1
        }).tween({
            y: 0
        }, 450, "easeOutQuart", 400);
        b[3].show().transform({
            y: -f.height - 1
        }).tween({
            y: 0
        }, 450, "easeOutQuart", 400);
        f.delayedCall(function() {
            f.disabled = false
        }, 850)
    };
    this.animateOut = function() {
        f.visible = false;
        if (f.over) {
            for (var n = 0; n < b.length; n++) {
                b[n].hide()
            }
            j.hide();
            k.anim.pause();
            k.tween({
                y: -f.height
            }, 400, "easeOutQuart");
            k.inner.tween({
                y: f.height
            }, 400, "easeOutQuart")
        } else {
            h.tween({
                opacity: 0
            }, 300, "easeOutSine");
            j.tween({
                y: -15,
                opacity: 0
            }, 300, "easeOutCubic");
            b[0].tween({
                y: -10
            }, 450, "easeOutQuart");
            b[1].tween({
                y: -f.height - 1
            }, 450, "easeOutQuart");
            b[2].tween({
                y: -f.height - 1
            }, 450, "easeOutQuart");
            b[3].tween({
                y: -f.height - 1
            }, 450, "easeOutQuart")
        }
        f.delayedCall(function() {
            h.invisible()
        }, 400)
    }
});
Class(function HamburgerButton() {
    Inherit(this, View);
    var h = this;
    var g, a;
    var b = Mobile.phone ? 40 : 44;
    (function() {
        e();
        d()
    })();

    function e() {
        g = h.element;
        g.size(b, b).css({
            bottom: 19,
            left: 15,
            opacity: 0
        }).setZ(100000000000).transform({
            y: 8
        });
        if (!Mobile.phone) {
            g.css({
                bottom: 60,
                left: 30
            })
        }
        a = g.create(".icon");
        a.size(b, b).css({
            opacity: 0.7
        }).bg(Config.IMAGES + "common/hamburger.png")
    }

    function d() {
        g.interact(c, f);
        g.hit.css({
            width: "150%",
            height: "150%",
            top: "-25%",
            left: "-25%"
        })
    }

    function c(i) {
        if (h.disabled) {
            return
        }
        switch (i.action) {
            case "over":
                a.tween({
                    opacity: 1
                }, 200, "easeOutSine");
                break;
            case "out":
                a.tween({
                    opacity: 0.7
                }, 200, "easeOutSine");
                break
        }
    }

    function f() {
        if (h.disabled) {
            return
        }
        c({
            action: "out"
        });
        h.disabled = true;
        h.delayedCall(function() {
            h.disabled = false
        }, 500);
        h.events.fire(HydraEvents.CLICK)
    }
    this.animateIn = function() {
        g.tween({
            opacity: 1,
            y: 0
        }, 300, "easeOutCubic")
    };
    this.animateOut = function() {
        g.tween({
            opacity: 0,
            y: 8
        }, 300, "easeInSine")
    }
});
Class(function HangoutCallout() {
    Inherit(this, View);
    var h = this;
    var f, g, a;
    (function() {
        d();
        c()
    })();

    function d() {
        f = h.element;
        f.shrink = 1;
        f.size(320, 230).css({
            right: 25,
            top: 25
        }).setZ(10);
        f.wrapper = f.create(".wrapper");
        f.wrapper.size(320, 230).css({
            opacity: 0
        }).bg(Config.IMAGES + "intro/tout.png").setZ(10);
        a = f.wrapper.create(".banner");
        a.size(320, 50).css({
            bottom: 0
        }).bg(Config.IMAGES + "live/banner.png");
        a.hover = a.create(".banner");
        a.hover.size(320, 50).css({
            opacity: 0
        }).bg(Config.IMAGES + "live/banner-hover.png");
        var i = a.create(".copy");
        i.fontStyle("GravurCondensed", 14, "#fff");
        i.css({
            left: 15,
            letterSpacing: 1,
            top: 6
        });
        i.text("ISEE-3 Control Center");
        var j = a.create(".copy");
        j.fontStyle("GravurCondensed", 14, "#fff");
        j.css({
            left: 15,
            letterSpacing: 1,
            top: 24
        });
        j.text("McMoon, California, USA")
    }

    function c() {
        f.interact(b, e)
    }

    function b(i) {
        switch (i.action) {
            case "over":
                a.hover.tween({
                    opacity: 1
                }, 100, "easeOutSine");
                break;
            case "out":
                a.hover.tween({
                    opacity: 0
                }, 300, "easeOutSine");
                break
        }
    }

    function e() {
        if (!ContactDevice.WEBGL) {
            getURL("https://www.youtube.com/watch?v=" + Config.HANGOUT_ID, "_blank")
        } else {
            h.events.fire(ContactEvents.BEGIN, {
                live: true
            });
            h.events.fire(ContactEvents.NAV_CLICK, {
                type: "live",
                index: 1
            })
        }
    }
    this.animateIn = function() {
        f.wrapper.transform({
            y: 50
        }).css({
            opacity: 0
        }).tween({
            y: 0,
            opacity: 1
        }, 600, "easeOutCubic")
    };
    this.animateOut = function() {
        f.wrapper.tween({
            y: 30,
            opacity: 0
        }, 500, "easeOutCubic")
    }
});
Class(function PlayPause() {
    Inherit(this, Controller);
    var g = this;
    var e, c, d;
    var b = 50;
    g.playing = true;
    (function() {
        f();
        a()
    })();

    function f() {
        e = g.container;
        e.size(b, b).center().setZ(100000000000).mouseEnabled(false).hide();
        Stage.addChild(e)
    }

    function a() {
        c = e.create(".play");
        c.size(b, b).bg(Config.IMAGES + "common/play.png").center().invisible();
        d = e.create(".play");
        d.size(b, b).bg(Config.IMAGES + "common/pause.png").center().css({
            opacity: 0
        })
    }
    this.play = function() {
        if (g.playing) {
            return
        }
        g.playing = true;
        e.show();
        d.stopTween().invisible().css({
            opacity: 0
        });
        c.stopTween().visible().css({
            opacity: 0.7
        }).tween({
            opacity: 0
        }, 500, "easeOutSine")
    };
    this.pause = function() {
        if (!g.playing) {
            return
        }
        g.playing = false;
        e.show();
        c.stopTween().invisible().css({
            opacity: 0
        });
        d.stopTween().visible().tween({
            opacity: 0.7
        }, 300, "easeOutSine")
    }
});
Class(function SatelliteAnim() {
    Inherit(this, View);
    var f = this;
    var h, d, j;
    var l, i, e = 1;
    f.width = 300;
    f.height = 300;
    (function() {
        c();
        k();
        b();
        g();
        a()
    })();

    function c() {
        h = f.element;
        h.size(f.width, f.height).center().hide().css({
            marginTop: -f.height * 0.6
        })
    }

    function k() {
        d = h.create(".satellite");
        d.size(200, 150).center().bg(Config.IMAGES + "common/satellite.png");
        i = f.initClass(CSSAnimation, d);
        i.duration = 30000;
        i.loop = true;
        i.frames = [{
            rotation: 0
        }, {
            rotation: 360
        }]
    }

    function b() {
        j = h.create(".copy");
        j.fontStyle("GravurCondensed", 18, "#fff");
        j.css({
            width: "100%",
            textAlign: "center",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            height: 30,
            top: "50%",
            marginTop: 130,
            opacity: 0,
            letterSpacing: 0.1
        })
    }

    function g() {
        l = [];
        for (var m = 0; m < 3; m++) {
            var o = h.create(".ring-" + m);
            o.size(250, 250).center().bg(Config.IMAGES + "common/ring.png");
            o.css({
                opacity: 0
            }).transform({
                scale: 0.5
            });
            var n = f.initClass(CSSAnimation, o);
            n.duration = 4200;
            n.loop = true;
            n.delay = 1400 * m;
            n.frames = [{
                opacity: 0,
                scale: 0.2
            }, {
                opacity: 1,
                scale: 0.6
            }, {
                opacity: 0,
                scale: 1
            }];
            l.push(n)
        }
    }

    function a() {
        e = Stage.height < 500 ? Stage.height / 500 : 1
    }
    this.animateIn = function(n) {
        f.visible = true;
        a();
        h.show().css({
            opacity: 0
        }).transform({
            scale: e * 0.7,
            rotation: -5
        }).tween({
            opacity: 1,
            scale: e,
            rotation: 0
        }, 1000, "easeOutCubic", 500);
        var o = n || "";
        j.text(o).transform({
            y: 10
        }).css({
            opacity: 0
        }).tween({
            opacity: 1,
            y: 0
        }, 500, "easeOutCubic", 1500);
        i.play();
        for (var m = 0; m < l.length; m++) {
            l[m].play()
        }
    };
    this.animateOut = function() {
        f.visible = false;
        h.tween({
            opacity: 0,
            scale: e * 0.92,
            rotation: -2
        }, 500, "easeInSine");
        j.tween({
            opacity: 0,
            y: 10
        }, 400, "easeOutCubic");
        f.delayedCall(function() {
            if (!f.visible) {
                h.hide();
                h.clearAlpha();
                i.stop();
                for (var m = 0; m < l.length; m++) {
                    l[m].stop()
                }
            }
        }, 800)
    }
});
Class(function DataExpand(e) {
    Inherit(this, View);
    var k = this;
    var m, o, d, c;
    var i, g;
    k.expanded = false;
    var b = new Vector2();
    b.y = 0;
    var q = new Vector2();
    (function() {
        f();
        n();
        l()
    })();

    function f() {
        m = k.element;
        m.size("100%").css({
            borderTop: "1px solid #333"
        }).css({
            overflow: "hidden"
        }).setZ(3);
        m.wrapper = m.create(".wrapper");
        m.wrapper.size("100%");
        c = m.wrapper.create("bg");
        c.size("100%").bg(Config.IMAGES + "colors/000.png");
        m.hide();
        d = m.wrapper.create("scroll");
        d.css({
            width: "100%",
            position: "relative",
            display: "block"
        })
    }

    function n() {
        o = e.create(".close");
        var r = Mobile.phone ? 40 : 60;
        o.size(r, r).bg(Config.IMAGES + "about/x.png").css({
            right: "2%",
            top: "2%",
            marginTop: Mobile.phone ? 10 : 0,
            opacity: 0.7
        }).setZ(10).hide()
    }

    function h() {
        q.lerp(b, Global.SCROLL_LERP);
        d.y = q.y;
        d.transform()
    }

    function l() {
        o.interact(j, p)
    }

    function j(r) {
        switch (r.action) {
            case "over":
                o.stopTween().transform({
                    rotation: 0
                }).tween({
                    opacity: 1,
                    rotation: -90
                }, 400, "easeOutCubic");
                break;
            case "out":
                o.tween({
                    opacity: 0.7,
                    rotation: -180
                }, 400, "easeOutCubic");
                break
        }
    }

    function p() {
        k.events.fire(HydraEvents.COMPLETE)
    }

    function a(s) {
        k.height = d.div.offsetHeight + 200;
        b.y += -s;
        var r = -k.height + (Stage.height);
        if (b.y < r) {
            b.y = r
        }
        if (b.y > 0) {
            b.y = 0
        }
    }
    this.animateIn = function(r) {
        if (i) {
            i = i.destroy()
        }
        i = k.initClass(DataExpandInfo, Config.DATAMODULES[r].info, null);
        Global.STATE_MODEL.replaceState("data/" + Config.DATAMODULES[r].perma);
        o.show().css({
            opacity: 0
        }).tween({
            opacity: 1
        }, 400, "easeOutSine", 500);
        d.add(i);
        d.transform({
            y: 0
        });
        b.y = 0;
        m.show().css({
            opacity: 0
        }).tween({
            opacity: 1
        }, 800, "easeOutSine", 200);
        k.delayedCall(i.animateIn, 200);
        if (!Device.mobile) {
            Render.startRender(h);
            ScrollUtil.link(a)
        } else {
            Mobile.overflowScroll(m.wrapper, false, true)
        }
    };
    this.animateOut = function() {
        Global.STATE_MODEL.replaceState("data");
        o.hide();
        Render.stopRender(h);
        ScrollUtil.unlink(a);
        m.tween({
            opacity: 0
        }, 200, "easeOutSine", function() {
            m.hide();
            if (i) {
                i = i.destroy()
            }
        })
    }
});
Class(function DataExpandInfo(d) {
    Inherit(this, View);
    var h = this;
    var l;
    var q = [];
    var p, e;
    var i;
    (function() {
        o();
        g();
        k()
    })();

    function g() {
        l = h.element;
        l.css({
            width: Stage.width,
            overflow: "hidden",
            position: "relative"
        });
        for (var s in d) {
            var t = d[s];
            var r = l.create(".section");
            r.css({
                position: "relative",
                width: e,
                overflow: "hidden",
                left: p
            });
            r.data = t;
            r.type = t.type;
            q.push(r);
            switch (t.type) {
                case "title":
                    j(r, t);
                    break;
                case "paragraph":
                    a(r, t);
                    break;
                case "img":
                    b(r, t);
                    break;
                case "video":
                    n(r, t);
                    break;
                case "download-links":
                    m(r, t);
                    break
            }
        }
    }

    function f() {
        var r = l.create(".line");
        r.type = "line";
        r.css({
            width: "100%",
            height: 4,
            display: "block",
            position: "relative",
            margin: "0 20px"
        }).bg("#fff");
        q.push(r)
    }

    function j(r, s) {
        r.fontStyle("Tungsten", 68, "#fff");
        r.css({
            letterSpacing: 8,
            marginTop: 68,
            marginBottom: 20
        });
        r.text(s.title);
        f()
    }

    function a(r, s) {
        r.div.className = "copy";
        r.fontStyle("GravurCondensed", 18, "#fff");
        r.css({
            lineHeight: 30,
            marginTop: 30,
            marginBottom: 30
        });
        r.html(s.text)
    }

    function b(r, s) {
        r.size(e, s.height * (e / 893)).bg(Config.IMAGES + "data/info/" + s.img + ".png");
        r.css({
            marginTop: 20,
            marginBottom: 20
        })
    }

    function n(r, s) {
        r.video = h.initClass(DataExpandVideo, s, null);
        r.css({
            marginBottom: 40
        });
        r.addChild(r.video);
        r.type = "video"
    }

    function m(r, t) {
        var s = h.initClass(DataExpandInfoLinks, t, null);
        r.add(s)
    }

    function o() {
        var r = Stage.width < 950;
        p = r ? 40 : "45%";
        e = r ? Stage.width - 80 : 640;
        i = r ? 0 : -e / 2
    }

    function k() {
        h.events.subscribe(ContactEvents.RESIZE, c)
    }

    function c() {
        o();
        l.css({
            width: Stage.width
        });
        for (var s in q) {
            var u = q[s];
            switch (u.type) {
                case "img":
                    var r = q[s].data.height * (e / 893);
                    u.size(e, r).css({
                        left: p,
                        marginLeft: i
                    });
                    break;
                case "video":
                    var t = Stage.width;
                    var r = Stage.width * (9 / 16);
                    u.size(t, r + 100).css({
                        left: 0
                    });
                    u.video.resize(t, r);
                    break;
                default:
                    u.css({
                        width: e,
                        left: p,
                        marginLeft: i
                    })
            }
        }
    }
    this.animateIn = function() {
        c();
        l.transform({
            y: 30
        }).tween({
            y: 0
        }, 800, "easeOutQuart")
    };
    this.animateOut = function() {}
});
Class(function DataExpandInfoLinks(b) {
    Inherit(this, View);
    var d = this;
    var c;
    (function() {
        a()
    })();

    function a() {
        c = d.element;
        c.size("100%", 90 * b.links.length).css({
            position: "relative",
            marginTop: 20,
            marginBottom: 20
        });
        for (var e in b.links) {
            var j = c.create("l");
            j.size("100%", 89).css({
                borderTop: "1px solid #777",
                borderBottom: "1px solid #777",
                top: 90 * e
            });
            var g = j.create("title");
            g.fontStyle("Tungsten", 60, "#fff");
            g.css({
                letterSpacing: 7,
                lineHeight: 94,
                textTransform: "uppercase"
            });
            g.text(b.links[e].title);
            if (b.links[e].url) {
                var f = j.create("btn");
                f.size(147, 41).css({
                    border: "2px solid #fff",
                    right: 6,
                    textAlign: "center",
                    lineHeight: 43
                }).center(0, 1);
                f.text("ACCESS");
                f.fontStyle("GravurCondensed", 24, "#fff")
            } else {
                var h = j.create("coming");
                h.size(180, 41).css({
                    border: "2px solid #333",
                    right: 6,
                    textAlign: "center",
                    lineHeight: 43
                }).center(0, 1);
                h.text("COMING SOON");
                h.fontStyle("GravurCondensed", 24, "#6f6f6f")
            }
        }
    }
});
Class(function DataExpandVideo(d) {
    Inherit(this, View);
    var i = this;
    var j, k, e, c, b, m;
    (function() {
        h();
        a();
        if (!Device.mobile) {
            i.delayedCall(function() {
                l(1)
            }, 200);
            g();
            f()
        } else {
            l()
        }
    })();

    function h() {
        j = i.element;
        j.size(Stage.width, Stage.width * (5 / 8)).css({
            position: "relative",
            display: "block",
            left: 0,
            marginTop: 50,
            marginBottom: 50
        })
    }

    function g() {
        var n = "http://img.youtube.com/vi/" + d.id + "/" + (d.hd ? "maxresdefault" : "hqdefault") + ".jpg";
        e = j.create(".bg");
        e.size("100%").bg(n, "50%", "50%").css({
            backgroundSize: "cover",
            opacity: 0.55
        }).setZ(1)
    }

    function f() {
        k = j.create(".title");
        k.fontStyle("Tungsten", 68, "#fff");
        k.css({
            letterSpacing: 8,
            bottom: 70,
            left: 50
        }).setZ(10);
        k.text(d.title.toUpperCase());
        m = j.create(".copy");
        m.fontStyle("GravurCondensed", 18, "#fff");
        m.css({
            lineHeight: 30,
            bottom: 50,
            left: 50
        });
        m.html(d.copy)
    }

    function a() {
        b = j.create(".video");
        b.size("100%").css({
            opacity: 0
        }).setZ(2)
    }

    function l(o) {
        var n = o || 0;
        b.div.innerHTML = '<iframe width="100%" height="100%" src="//www.youtube.com/embed/' + d.id + '?autoplay="' + n + ' frameborder="0" allowfullscreen></iframe>';
        b.tween({
            opacity: 1
        }, 1000, "easeOutSine", 1000)
    }
    this.resize = function(o, n, p) {
        j.size(o, n);
        b.size(o, n)
    }
});
Class(function DataInfoBtn(g) {
    Inherit(this, View);
    var h = this;
    var f, a;
    (function() {
        d();
        c()
    })();

    function d() {
        f = h.element;
        f.size(23, 23).css({
            right: "6%",
            top: "5%"
        });
        f.transform({
            scale: 0.5
        }).css({
            opacity: 0
        });
        a = f.create(".icon");
        a.size(23, 23).bg(Config.IMAGES + "data/info-icon.png").css({
            opacity: 0.6
        })
    }

    function c() {
        f.interact(b, e);
        f.hit.css({
            width: "200%",
            height: "200%",
            top: "-50%",
            left: "-50%"
        })
    }

    function b(i) {
        switch (i.action) {
            case "over":
                a.tween({
                    opacity: 1
                }, 200, "easeOutSine");
                break;
            case "out":
                a.tween({
                    opacity: 0.6
                }, 200, "easeOutSine");
                break
        }
    }

    function e() {
        f.tween({
            scale: 0.8
        }, 130, "easeInOutQuart");
        h.events.fire(HydraEvents.CLICK, {
            index: +g
        })
    }
    this.resize = function(i) {};
    this.animateIn = function() {
        f.tween({
            scale: 1,
            opacity: 1
        }, 300, "easeOutBack")
    };
    this.animateOut = function() {
        f.tween({
            scale: 0.5,
            opacity: 0
        }, 300, "easeInBack")
    }
});
Class(function DataModule(b, l) {
    Inherit(this, View);
    var g = this;
    var k;
    var o, m;
    var c, f;
    var e;
    (function() {
        d();
        j();
        i();
        if (b.info) {
            a();
            h()
        }
    })();

    function d() {
        k = g.element;
        k.size(0, 0).setZ(1);
        o = k.create("inner");
        o.size("100%");
        o.css({
            border: "1px solid #333"
        }).transform({
            y: Stage.height
        });
        if (b.type == "disabled") {
            o.bg(Config.IMAGES + "data/disabled.png")
        } else {
            o.bg(Config.IMAGES + "colors/000.png")
        }
    }

    function j() {
        m = o.create("title");
        m.css({
            fontFamily: "GravurCondensed",
            color: "#fff",
            left: "6%",
            top: "5%"
        }).setZ(10);
        if (b.title) {
            m.text(b.title.toUpperCase())
        }
    }

    function a() {
        c = g.initClass(DataInfoBtn, l, null);
        o.add(c)
    }

    function i() {
        var p;
        switch (b.type) {
            case "text":
                p = "TextDataModule";
                break;
            case "status":
                p = "StatusDataModule";
                break;
            case "number":
                p = "NumberDataModule";
                break;
            case "graph":
                p = "GraphDataModule";
                break;
            case "spin":
                p = "SpinDataModule";
                break
        }
        if (p && b.content) {
            f = g.initClass(window[p], b.content, null);
            o.add(f);
            if (b.type == "graph") {
                f.element.size("100%")
            } else {
                f.element.size("86%", "72%").css({
                    left: "6%",
                    top: "20%"
                })
            }
        }
    }

    function h() {
        g.events.bubble(c, HydraEvents.CLICK)
    }

    function n(p) {
        m.css({
            fontSize: 18
        });
        if (c) {
            c.resize(p)
        }
        if (f) {
            f.resize(p)
        }
    }
    this.resize = function(r) {
        e = r;
        var q = Math.ceil(480 * r);
        var p = Math.ceil(480 * r);
        k.size(q, p);
        o.size(q, p);
        n(r);
        return {
            width: q + 1,
            height: p + 1
        }
    };
    this.position = function(p, q) {
        g._x = p;
        g._y = q;
        k.transform({
            x: g._x,
            y: g._y
        })
    };
    this.animateIn = function() {
        m.css({
            opacity: 0
        }).transform({
            x: 30 * e
        });
        o.transform({
            y: Stage.height * 0.35
        }).css({
            opacity: 0
        }).tween({
            y: 0,
            opacity: 1
        }, Stage.height * 0.5, "easeOutCubic");
        m.tween({
            opacity: 1,
            x: 0
        }, 500, "easeOutCubic", 300);
        if (c) {
            g.delayedCall(c.animateIn, 300)
        }
    };
    this.animateOut = function() {
        o.tween({
            y: Stage.height * 0.1,
            opacity: 0
        }, Stage.height * 0.5, "easeInOutCubic");
        m.tween({
            opacity: 0,
            x: 20 * e
        }, 300, "easeOutCubic");
        if (c) {
            c.animateOut()
        }
    };
    this.reset = function() {
        o.transform({
            y: Stage.height * 0.2
        }).css({
            opacity: 0
        })
    }
});
Class(function SpinDataModule(b) {
    Inherit(this, View);
    var e = this;
    var g, i, h;
    var a;
    (function() {
        c();
        d();
        f()
    })();

    function c() {
        g = e.element;
        g.size("100%")
    }

    function d() {
        i = g.create(".spin");
        i.size(197, 206).center().bg(Config.IMAGES + "data/custom/spin.png").css({
            marginTop: -150
        })
    }

    function f() {
        h = g.create("label");
        h.fontStyle("Tungsten", 80, b.color);
        h.css({
            width: "100%",
            bottom: "0%",
            textAlign: "center"
        });
        var j = b.value;
        j += " " + b.label.toUpperCase();
        h.text(j)
    }
    this.resize = function(j) {
        i.scale = j;
        i.transform();
        h.css({
            fontSize: 80 * j
        })
    }
});
Class(function StatusDataModule(a) {
    Inherit(this, View);
    var e = this;
    var b;
    var d;
    (function() {
        c()
    })();

    function c() {
        d = [];
        for (var f in a) {
            var g = e.initClass(StatusDataModuleStat, {
                pos: f,
                data: a[f]
            });
            d.push(g)
        }
    }
    this.resize = function(g) {
        for (var f in d) {
            d[f].resize(g)
        }
    }
});
Class(function StatusDataModuleStat(g) {
    Inherit(this, View);
    var e = this;
    var f;
    var h, i;
    var c;
    (function() {
        d();
        if (g.data.value == "date") {
            c = setInterval(b, 500)
        }
        if (g.data.value == "time") {
            c = setInterval(a, 500)
        }
    })();

    function d() {
        f = e.element;
        f.size("100%", "33%").css({
            top: g.pos * 33 + "%"
        });
        h = f.create("label");
        h.css({
            fontFamily: "GravurCondensed",
            color: Config.DATACOLORS.grey
        });
        h.text(g.data.label.toUpperCase());
        i = f.create("value");
        i.css({
            fontFamily: "Tungsten",
            color: g.data.color,
            top: "14%"
        });
        i.text(g.data.value.toUpperCase())
    }

    function b() {
        var l = new Date();
        var m = l.getUTCFullYear();
        var j = l.getUTCDate();
        var n = l.getUTCMonth();
        if (j.toString().length == 1) {
            n = "0" + n
        }
        if (j.toString().length == 1) {
            j = "0" + j
        }
        var k = n + "/" + j + "/" + m;
        i.text(k)
    }

    function a() {
        var l = new Date();
        var j = l.getUTCHours();
        var n = l.getUTCMinutes();
        var k = l.getUTCSeconds();
        if (j.toString().length == 1) {
            j = "0" + j
        }
        if (n.toString().length == 1) {
            n = "0" + n
        }
        if (k.toString().length == 1) {
            k = "0" + k
        }
        var m = j + ":" + n + ":" + k;
        i.text(m)
    }
    this.resize = function(j) {
        h.css({
            fontSize: 14 * j
        });
        i.css({
            fontSize: 80 * j,
            letterSpacing: 4 * j
        })
    };
    this.destroy = function() {
        clearInterval(c);
        return e._destroy()
    }
});
Class(function TextDataModule(c) {
    Inherit(this, View);
    var e = this;
    var d, b;
    (function() {
        a()
    })();

    function a() {
        d = e.element;
        b = d.create("copy");
        b.css({
            fontFamily: "GravurCondensed",
            color: "#fff",
            width: "100%"
        });
        b.html(c.text)
    }
    this.resize = function(f) {
        b.css({
            fontSize: 22 * f,
            lineHeight: 34 * f,
            letterSpacing: 2 * f
        })
    }
});
Class(function GraphDataModule(d) {
    Inherit(this, View);
    var f = this;
    var e, a;
    (function() {
        c();
        if (d.label) {
            b()
        }
    })();

    function c() {
        e = f.element;
        e.size("100%", "100%", false);
        if (d.img) {
            e.bg(Config.IMAGES + "data/graphs/" + d.img + ".png", "50%", "50%").css({
                backgroundSize: "cover"
            })
        }
    }

    function b() {
        a = e.create("label");
        a.css({
            fontFamily: "GravurCondensed",
            color: Config.DATACOLORS.grey,
            width: "100%",
            textAlign: "center",
            bottom: "9%"
        });
        a.text(d.label.toUpperCase())
    }
    this.resize = function(g) {
        if (a) {
            a.css({
                fontSize: 13 * g
            })
        }
    }
});
Class(function NumberDataModule(d) {
    Inherit(this, View);
    var f = this;
    var e;
    var b, a;
    (function() {
        c()
    })();

    function c() {
        e = f.element;
        b = e.create("value");
        b.css({
            fontFamily: "Tungsten",
            color: d.color,
            width: "100%",
            textAlign: "center",
            top: "5%"
        });
        if (d.temp) {
            b.html(d.value + "&#186;")
        } else {
            b.text(d.value)
        }
        a = e.create("label");
        a.css({
            fontFamily: "GravurCondensed",
            color: Config.DATACOLORS.grey,
            width: "100%",
            textAlign: "center",
            bottom: "1%"
        });
        a.text(d.label.toUpperCase())
    }
    this.resize = function(g) {
        a.css({
            fontSize: 13 * g
        });
        b.css({
            fontSize: 300 * g,
            lineHeight: 300 * g,
            height: 300 * g
        })
    }
});
Class(function ModuleTransition() {
    Inherit(this, View);
    var f = this;
    var i;
    var c;
    var d;
    var k, j, l;
    (function() {
        e();
        g()
    })();

    function e() {
        i = f.element;
        i.size(Stage.width, Stage.height).mouseEnabled(false).css({
            top: 1,
            opacity: 0
        }).setZ(2);
        d = i.create("bg");
        d.size(Stage.width, Stage.height).bg(Config.IMAGES + "colors/000.png");
        c = f.initClass(Warp, d)
    }

    function h(m, o, n) {
        c.points[0].x = m + 1;
        c.points[0].y = o + 1;
        c.points[1].x = m + n.width - 1;
        c.points[1].y = o + 1;
        c.points[2].x = m + 1;
        c.points[2].y = o + n.height - 1;
        c.points[3].x = m + n.width - 1;
        c.points[3].y = o + n.height - 1;
        c.render()
    }

    function b() {
        c.points[0].x = 0;
        c.points[0].y = 0;
        c.points[1].x = Stage.width;
        c.points[1].y = 0;
        c.points[2].x = 0;
        c.points[2].y = Stage.height;
        c.points[3].x = Stage.width;
        c.points[3].y = Stage.height;
        c.render()
    }

    function g() {
        f.events.subscribe(ContactEvents.RESIZE, a)
    }

    function a() {
        i.size(Stage.width, Stage.height);
        d.size(Stage.width, Stage.height)
    }
    this.expand = function(m, o, n) {
        k = m;
        j = o;
        l = n;
        i.mouseEnabled(true);
        h(m, o, n);
        i.tween({
            opacity: 1
        }, 150, "easeOutSine");
        c.tween("tl", {
            x: 0,
            y: 0
        }, Utils.doRandom(450, 600), "easeOutExpo", 100);
        c.tween("tr", {
            x: Stage.width,
            y: 0
        }, Utils.doRandom(450, 600), "easeOutExpo", 100);
        c.tween("bl", {
            x: 0,
            y: Stage.height
        }, Utils.doRandom(450, 600), "easeOutExpo", 100);
        c.tween("br", {
            x: Stage.width,
            y: Stage.height
        }, Utils.doRandom(450, 600), "easeOutExpo", 100);
        f.expanded = true
    };
    this.collapse = function() {
        i.mouseEnabled(false);
        c.tween("tl", {
            x: k + 1,
            y: j + 1
        }, Utils.doRandom(350, 500), "easeOutExpo");
        c.tween("tr", {
            x: k + l.width,
            y: j + 1
        }, Utils.doRandom(350, 500), "easeOutExpo");
        c.tween("bl", {
            x: k + 1,
            y: j + l.height - 1
        }, Utils.doRandom(350, 500), "easeOutExpo");
        c.tween("br", {
            x: k + l.width,
            y: j + l.height - 1
        }, Utils.doRandom(350, 500), "easeOutExpo");
        i.tween({
            opacity: 0
        }, 300, "easeOutSine", 250);
        f.expanded = false
    };
    this.update = function(m, o, n) {
        k = m;
        j = o;
        l = n;
        if (f.expanded) {
            b()
        }
    }
});
Class(function BaseElement() {
    Inherit(this, Component);
    var b = this;
    var a;
    this.visible = false;
    (function() {})();
    this.show = function() {
        if (!this.mesh) {
            return
        }
        this.visible = true;
        this.mesh.traverse(function(c) {
            if (c.material) {
                c.material.visible = true
            }
            if (c.material instanceof THREE.SpriteMaterial) {
                c.material.opacity = 1
            }
        })
    };
    this.hide = function(c) {
        if (!this.mesh) {
            return
        }
        this.visible = false;
        this.mesh.traverse(function(d) {
            if (d.material) {
                d.material.visible = false
            }
            if (d.material instanceof THREE.SpriteMaterial) {
                d.material.opacity = 0
            }
        })
    };
    this.addTo = function(c) {
        if (!this.mesh) {
            return
        }
        if (!Global.ELEMENTS) {
            return
        }
        a = c || Global.ELEMENTS.scene;
        a.add(this.mesh);
        this.hide(true)
    }
});
Class(function CometElement() {
    Inherit(this, BaseElement);
    var f = this;
    var p, n, m, g;
    var d = {};
    var l = new LinkedList();
    var k = new Vector3();
    var c = new Matrix4();
    var e = 1;
    this.mesh = new THREE.Object3D();
    (function() {
        b();
        o();
        h();
        f.addTo()
    })();

    function j() {
        p = new THREE.Object3D();
        p.position.x = 80;
        f.mesh.add(p);
        p.scale.set(1.25, 1.25, 1.25);
        d.inner = new CometElementCore(true, 70);
        p.add(d.inner.mesh)
    }

    function o() {
        var u = new THREE.Geometry();
        var q = {
            map: {
                type: "t",
                value: THREE.ImageUtils.loadTexture(Config.IMAGES + "elements/common/particle.png")
            },
            size: {
                type: "f",
                value: 10
            },
            scale: {
                type: "f",
                value: 3
            },
            brightness: {
                type: "f",
                value: 0.2
            }
        };
        var t = new THREE.ShaderMaterial({
            uniforms: q,
            vertexShader: Hydra.SHADERS["CometTrail.vs"],
            fragmentShader: Hydra.SHADERS["CometTrail.fs"]
        });
        t.transparent = true;
        t.depthTest = false;
        t.depthWrite = false;
        t.blending = THREE.AdditiveBlending;
        for (var s = 0; s < 2500; s++) {
            var r = new THREE.Vector3();
            r.x = Utils.doRandom(-2000, 50);
            r.y = Utils.doRandom(-200, 200);
            r.z = Utils.doRandom(-120, 120);
            r.zs = Utils.doRandom(-10, 10) / 10;
            u.vertices.push(r);
            l.push(r)
        }
        n = new THREE.ParticleSystem(u, t);
        f.mesh.add(n);
        Render.nextFrame(function() {
            if (!m) {
                f.setSize(20)
            }
        })
    }

    function b() {
        var q = new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture("assets/images/glows/comet.png"),
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        p = new THREE.Object3D();
        p.position.x = 80;
        f.mesh.add(p);
        g = new THREE.Mesh(new THREE.PlaneGeometry(390, 390), q);
        p.add(g)
    }

    function i(q) {
        k.set(1, 0, 0);
        c.identity().setRotation(0, Utils.toRadians(Utils.doRandom(0, 360)), Utils.toRadians(Utils.doRandom(-90, 90)));
        c.transformVector(k);
        k.multiply(100);
        k.x += 130;
        k.copyTo(q)
    }

    function h() {
        f.events.subscribe(ContactEvents.RESIZE, a)
    }

    function a() {
        e = Stage.width / 1280;
        f.setSize(m / ContactDevice.pixelRatio)
    }
    this.update = function(r) {
        if (!this.visible) {
            return
        }
        var s = 15;
        var u = 7.5;
        var q = l.start();
        while (q) {
            q.x -= s;
            if (q.x < -2000) {
                i(q)
            }
            q.y += u * (q.zs * Utils.convertRange(q.x, 0, -5000, 0.1, 1));
            q = l.next()
        }
        n.geometry.verticesNeedUpdate = true;
        g.quaternion.copy(Data.CAMERA.worldCamera.quaternion);
        p.quaternion.copy(f.mesh.quaternion).inverse()
    };
    this.setSize = function(q) {
        m = q * ContactDevice.pixelRatio;
        n.material.uniforms.size.value = m * e
    };
    this.fadeOut = function(r, q) {
        TweenManager.tween(g.material, {
            opacity: 0
        }, r, "easeOutSine", q || 0);
        return TweenManager.tween(n.material.uniforms.brightness, {
            value: 0
        }, r, "easeOutSine", q || 0)
    };
    this.setBrightness = function(q) {
        n.material.uniforms.brightness.value = q
    };
    this.resetFade = function() {
        g.material.opacity = 1;
        n.material.uniforms.brightness.value = 0.2
    }
});
Class(function CometElementCore(f, d) {
    var h = this;
    var a;
    var e = Date.now();
    var c = ["x", "y", "z"];
    this.mesh = null;
    (function() {
        b();
        g()
    })();

    function b() {
        var i = {
            h: {
                type: "f",
                value: 0.1
            },
            l: {
                type: "f",
                value: 0.9
            },
            lightColor: {
                type: "c",
                value: new THREE.Color(16777215)
            }
        };
        var j = 1;
        if (!f) {}
        var l = new THREE.ShaderMaterial({
            uniforms: i,
            vertexShader: Hydra.SHADERS["CometRock.vs"],
            fragmentShader: Hydra.SHADERS["CometRock.fs"]
        });
        l.transparent = true;
        l.blending = THREE.AdditiveBlending;
        var k = new THREE.IcosahedronGeometry(d, j);
        h.mesh = new THREE.Mesh(k, l)
    }

    function g() {
        var j = 4;
        var i = 10;
        var k = 0.0025;
        a = {};
        a.x = Utils.doRandom(0, j);
        a.y = Utils.doRandom(0, j);
        a.z = Utils.doRandom(0, j);
        a.vx = i * k;
        a.vy = i * k;
        a.vz = i * k
    }
    this.update = function(l) {
        var m = (l - e) * 0.00025;
        for (var k = 0; k < 3; k++) {
            var j = c[k];
            switch (a[j]) {
                case 0:
                    h.mesh.rotation[j] += Math.cos(Math.sin(m * 0.25)) * a["v" + j];
                    break;
                case 1:
                    h.mesh.rotation[j] += Math.cos(Math.sin(m * 0.25)) * a["v" + j];
                    break;
                case 2:
                    h.mesh.rotation[j] += Math.cos(Math.cos(m * 0.25)) * a["v" + j];
                    break
            }
        }
    }
});
Class(function DotElement() {
    Inherit(this, BaseElement);
    var b;
    var c = this;
    (function() {
        var h = new THREE.IcosahedronGeometry(15, 1);
        var f = new THREE.MeshBasicMaterial({
            color: 16777215
        });
        var e = new THREE.Mesh(h, f);
        var g = new THREE.PlaneGeometry(256 / 2, 256 / 2, 1, 1);
        var d = new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture(Config.IMAGES + "elements/l1.png"),
            transparent: true
        });
        b = new THREE.Mesh(g, d);
        b.position.x += 100;
        b.position.y += 100;
        e.add(b);
        c.mesh = e;
        c.addTo();
        Render.startRender(a)
    })();

    function a() {
        b.quaternion.copy(Data.CAMERA.worldCamera.quaternion)
    }
    this.reset = function() {
        c.mesh.position.set(0, 0, 0);
        c.mesh.scale.set(1, 1, 1)
    }
});
Class(function EarthElement() {
    Inherit(this, BaseElement);
    var f = this;
    var k, b, m, l, g;
    var a = [];
    var h = [];
    var d = Date.now();
    this.mesh = this.object3D = new THREE.Object3D();
    this.geometryRadius = 100;
    (function() {
        i();
        c();
        j();
        e();
        f.addTo()
    })();

    function e() {
        f.mesh.position.multiplyScalar(0);
        f.mesh.scale.set(1, 1, 1);
        m.rotation.x = Math.PI / 2 * 0.9;
        l = 0.001;
        if (f.spaceOut) {
            f.spaceOut(true)
        }
    }

    function i() {
        m = new THREE.Object3D();
        f.object3D.add(m);
        var o = new TextureMaterial(Config.IMAGES + "elements/earth/earth-texture.jpg");
        var n = new THREE.IcosahedronGeometry(f.geometryRadius, 2);
        var p = new THREE.Mesh(n, o.material);
        m.add(p)
    }

    function j() {
        var o = [{
            color: 16711680,
            h: 0.6,
            l: 0.6
        }, {
            color: 16149827,
            h: 0.26,
            l: 0.8
        }];
        var s = THREE.ImageUtils.loadTexture(Config.IMAGES + "elements/earth/earth-clouds-alpha.png");
        s.wrapS = s.wrapT = THREE.RepeatWrapping;
        var r = new THREE.IcosahedronGeometry(102, Device.mobile ? 1 : 2);
        for (var q = 0; q < o.length; q++) {
            var u = o[q];
            var n = {
                color: {
                    type: "c",
                    value: new THREE.Color(16711680)
                },
                h: {
                    type: "f",
                    value: 0.6
                },
                l: {
                    type: "f",
                    value: 0.6
                },
                lightPosition: {
                    type: "v3",
                    value: new THREE.Vector3(500, 0, 0)
                },
                cloudMap: {
                    type: "t",
                    value: s
                },
                time: {
                    type: "f",
                    value: 1
                },
                uvOffset: {
                    type: "v2",
                    value: new THREE.Vector2(0, 0)
                },
                uvSpeed: {
                    type: "f",
                    value: 1
                },
                uvAlpha: {
                    type: "f",
                    value: 0.5
                }
            };
            var p = new THREE.ShaderMaterial({
                uniforms: n,
                shading: THREE.FlatShading,
                vertexShader: Hydra.SHADERS["Earth.vs"],
                fragmentShader: Hydra.SHADERS["Earth.fs"]
            });
            p.transparent = true;
            p.depthWrite = false;
            a.push(p);
            var t = new THREE.Mesh(r, p);
            t.material.uniforms.color.value = new THREE.Color(u.color);
            t.material.uniforms.h.value = u.h;
            t.material.uniforms.l.value = u.l;
            if (q == 1) {
                t.scale.set(1.04, 1.04, 1.04)
            }
            h.push(t);
            m.add(t)
        }
        a[0].uniforms.uvOffset.value.set(-0.5, 1);
        a[1].uniforms.uvOffset.value.set(0.75, 0);
        a[0].uniforms.uvSpeed.value = 0.5;
        a[1].uniforms.uvSpeed.value = 0.5;
        a[1].uniforms.uvAlpha.value = 0.3;
        a[0].uniforms.uvAlpha.value = 0.45
    }

    function c() {
        var n = new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture("assets/images/glows/earth.png"),
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        n.opacity = 0.5;
        g = new THREE.Mesh(new THREE.PlaneGeometry(700, 700), n);
        f.object3D.add(g)
    }
    this.update = function(o) {
        for (var n = 0; n < 2; n++) {
            a[n].uniforms.time.value = 0.005 * (o - d)
        }
        m.rotation.y += l;
        g.quaternion.copy(Data.CAMERA.worldCamera.quaternion)
    };
    this.orbitSpeed = function(n) {
        l = n
    };
    this.hideGlow = function() {
        g.material.visible = false
    };
    this.showGlow = function() {
        g.material.visible = true
    };
    this.depthTest = function(n) {
        a[0].depthTest = n;
        a[1].depthTest = n
    };
    this.specular = function(n, p, o) {
        a[0].uniforms.lightPosition.value.set(n, p, o);
        a[1].uniforms.lightPosition.value.set(n, p, o)
    };
    this.spaceOut = function(n) {
        if (n) {
            h[0].scale.set(1, 1, 1);
            h[1].scale.set(1.04, 1.04, 1.04)
        } else {
            h[0].scale.set(1.08, 1.08, 1.08);
            h[1].scale.set(1.16, 1.16, 1.16)
        }
    };
    this.reset = e
});
Class(function MoonElement() {
    Inherit(this, BaseElement);
    var g = this;
    var f, e, d;
    this.geometryRadius = 27;
    (function() {
        a();
        c();
        b();
        g.addTo()
    })();

    function a() {
        f = new THREE.Object3D();
        g.mesh = f;
        var i = THREE.ImageUtils.loadTexture(Config.IMAGES + "elements/moon/moon.jpg");
        i.anisotropy = 2;
        var h = {
            map: {
                type: "t",
                value: i
            },
            normalMap: {
                type: "t",
                value: THREE.ImageUtils.loadTexture(Config.IMAGES + "elements/moon/normal.jpg")
            },
            lightPosition: {
                type: "v3",
                value: new THREE.Vector3(0, 1, 0)
            },
            real: {
                type: "f",
                value: 0
            },
        };
        var k = new THREE.ShaderMaterial({
            uniforms: h,
            shading: THREE.FlatShading,
            vertexShader: Hydra.SHADERS["MoonBump.vs"],
            fragmentShader: Hydra.SHADERS["MoonBump.fs"]
        });
        var j = new THREE.IcosahedronGeometry(g.geometryRadius, 2);
        var l = new THREE.Mesh(j, k);
        e = k;
        f.add(l)
    }

    function c() {
        var h = {
            color: {
                type: "c",
                value: new THREE.Color(16711680)
            },
            h: {
                type: "f",
                value: 0.26
            },
            l: {
                type: "f",
                value: 0.8
            },
            lightPosition: {
                type: "v3",
                value: new THREE.Vector3(0, 1, 0)
            },
            opacity: {
                type: "f",
                value: 0.3
            },
            real: {
                type: "f",
                value: 0
            },
        };
        var j = new THREE.ShaderMaterial({
            uniforms: h,
            shading: THREE.FlatShading,
            vertexShader: Hydra.SHADERS["Moon.vs"],
            fragmentShader: Hydra.SHADERS["Moon.fs"]
        });
        j.transparent = true;
        var i = new THREE.IcosahedronGeometry(28, 2);
        var k = new THREE.Mesh(i, j);
        d = j;
        f.add(k)
    }
    this.update = function() {
        if (Global.ELEMENTS && !Global.LIVE_VIEW) {
            f.position.x = Math.cos(this.angle) * this.radius;
            f.position.y = Math.sin(this.angle) * this.radius;
            this.angle -= this.speed;
            f.rotation.z = this.angle
        }
    };
    this.reset = b;

    function b() {
        g.angle = Math.PI / 4;
        g.radius = 400;
        g.speed = 0.0002
    }
    this.realShading = function(h) {
        if (!h) {
            e.uniforms.real.value = 0;
            d.uniforms.real.value = 0;
            d.uniforms.opacity.value = 1
        } else {
            e.uniforms.real.value = 1;
            d.uniforms.real.value = 1;
            d.uniforms.opacity.value = 0.3
        }
    };
    this.realShading()
});
Class(function SatelliteElement(i) {
    Inherit(this, BaseElement);
    var h = this;
    var j, k, c, a;
    var f = 1;
    var b = 0.005;
    var d = 0.7;
    this.mesh = new THREE.Object3D();
    this.speed = b;
    this.satellite = null;
    (function() {
        e();
        g();
        h.addTo()
    })();

    function g() {
        h.opacity = 1;
        h.speed = b
    }

    function e() {
        var m = new THREE.JSONLoader();
        var o = m.parse(i ? Hydra.JSON.satellite_small : Hydra.JSON.satellite_model).geometry;
        var l = {
            ambient: {
                type: "c",
                value: new THREE.Color(4473924)
            },
            color: {
                type: "c",
                value: new THREE.Color(5329239)
            },
            lightColor: {
                type: "c",
                value: new THREE.Color(8947848)
            },
            additiveColor: {
                type: "c",
                value: new THREE.Color(14018248)
            },
            secondaryColor: {
                type: "c",
                value: new THREE.Color(5329239)
            },
            lightPosition: {
                type: "v3",
                value: new THREE.Vector3(0, 50, -50)
            },
            opacity: {
                type: "f",
                value: f
            },
            additiveAmount: {
                type: "f",
                value: 0.1
            },
            secondaryAmount: {
                type: "f",
                value: 0.1
            },
        };
        var n = i ? new THREE.MeshBasicMaterial({
            color: 16777215,
            transparent: true
        }) : new THREE.ShaderMaterial({
            uniforms: l,
            vertexShader: Hydra.SHADERS["Satellite.vs"],
            fragmentShader: Hydra.SHADERS["Satellite.fs"],
            transparent: true
        });
        a = n;
        c = new THREE.Object3D();
        h.mesh.add(c);
        j = new THREE.Mesh(o, n);
        j.matrixAutoUpdate = true;
        j.material.transparent = true;
        c.add(j);
        h.mesh.name = i ? "SatelliteSmall" : "SatelliteElement";
        if (i) {
            n.blending = THREE.AdditiveBlending;
            n.depthTest = false;
            n.depthWrite = false
        }
        h.satellite = c;
        k = new THREE.EdgesHelper(j, 14540253);
        k.material.linewidth = Device.system.retina ? 1 : 1;
        k.material.opacity = d;
        if (!i) {
            c.add(k)
        } else {
            j.material.depthTest = false
        }
    }
    this.update = function(l) {
        c.rotation.z -= this.speed
    };
    this.reset = g;
    this.edgeWidth = function(l) {
        if (k) {
            k.material.linewidth = l
        }
    };
    this.set("opacity", function(l) {
        f = l;
        if (!k) {
            return
        }
        k.material.opacity = l * d;
        if (j.material.uniforms) {
            j.material.uniforms.opacity.value = l
        }
        j.material.opacity = l
    });
    this.get("opacity", function() {
        return f
    });
    this.fadeOut = function(m, l) {
        TweenManager.tween(h, {
            opacity: 0
        }, m, "easeOutSine", l)
    };
    this.fadeIn = function(m, l) {
        TweenManager.tween(h, {
            opacity: 1
        }, m, "easeOutSine", l)
    };
    this.color = function(m, l) {
        if (!(m instanceof THREE.Color)) {
            m = new THREE.Color(m)
        }
        a.uniforms.additiveColor.value = m;
        if (l) {
            a.uniforms.additiveAmount.value = l
        }
    }
});
Class(function SpaceElement() {
    Inherit(this, Component);
    var i = this;
    var k, b, m;
    var l, o, e;
    var d = !ContactDevice.CHROME_OS && Mobile.os != "Android";
    (function() {
        a();
        Global.GL.register("space", i);
        if (Mobile.os == "Android") {
            return
        }
        g();
        f();
        n();
        j();
        i.derp = true
    })();

    function g() {
        k = new THREE.Scene();
        b = new THREE.PerspectiveCamera(60, Stage.width / Stage.height, 1, 100000);
        b.position.z = 2000;
        b.updateMatrix();
        b.matrixAutoUpdate = false
    }

    function a() {
        e = i.initClass(StarsElement, i)
    }

    function f() {
        var p = new THREE.MeshLambertMaterial({
            side: THREE.BackSide,
            color: 657930
        });
        var q = new THREE.SphereGeometry(100, 100, 100);
        m = new THREE.Mesh(q, p);
        m.scale.set(17, 17, 17);
        k.add(m)
    }

    function h() {
        var q = [new THREE.Vector3(0, 0, 1500), new THREE.Vector3(1500, 0, 0), new THREE.Vector3(-1500, 0, 0), new THREE.Vector3(0, 0, -1500), new THREE.Vector3(0, 1500, 0), new THREE.Vector3(0, -1500, 0), ];
        for (var r = 0; r < q.length; r++) {
            var p = new THREE.PointLight(16777215);
            p.intensity = (!Device.mobile && Device.system.retina ? 1.4 : 0.7);
            p.position = q[r];
            k.add(p)
        }
    }

    function n() {
        l = i.initClass(SpaceElementPath);
        o = i.initClass(SpaceElementLights, l);
        k.add(o.object3D)
    }

    function j() {
        i.events.subscribe(ContactEvents.RESIZE, c)
    }

    function c() {
        b.aspect = Stage.width / Stage.height;
        b.updateProjectionMatrix()
    }
    this.render = function(p) {
        if (d) {
            Global.RENDERER.render(k, b)
        }
        e.render()
    };
    this.update = function(p) {
        if (d) {
            o.update(p)
        }
    }
});
Class(function SpaceElementLights(c) {
    Inherit(this, Component);
    var f = this;
    var d = new LinkedList();
    var b = new Vector3();
    var e = false;
    this.object3D = new THREE.Object3D();
    (function() {
        f.object3D.matrixAutoUpdate = false;
        a()
    })();

    function a() {
        for (var h = 0; h < 5; h++) {
            var g = new THREE.PointLight(16777215, 2.1, 4000);
            f.object3D.add(g);
            if (e) {
                g.debug = new THREE.Mesh(new THREE.BoxGeometry(20, 20, 20), new THREE.MeshNormalMaterial());
                f.object3D.add(g.debug)
            }
            d.push(g)
        }
    }
    this.update = function(j) {
        var h = 0;
        var g = d.start();
        while (g) {
            var m = b.distanceTo(g.position);
            var l = Utils.convertRange(m, 0, 1500, 0, 1);
            var k = c.getPosition(j - (h * 5600), 60);
            if (k) {
                g.position.copy(k);
                if (g.debug) {
                    g.debug.position.copy(k)
                }
            }
            g.color.setHSL(l, 0.75, 0.5);
            h++;
            g = d.next()
        }
    }
});
Class(function SpaceElementPath() {
    Inherit(this, Component);
    var h = this;
    var c, b, e, g;
    var d = 45;
    this.mesh = null;
    (function() {
        f();
        a()
    })();

    function f() {
        b = new THREE.Vector3();
        e = new THREE.Vector3()
    }

    function a() {
        var j = new THREE.Curves.GrannyKnot();
        c = new THREE.TubeGeometry(j, 50, true, false, 2);
        c.applyMatrix(new THREE.Matrix4().makeScale(d, d, d));
        var i = new THREE.MeshNormalMaterial();
        g = new THREE.Mesh(c, i);
        h.mesh = g
    }
    this.getPosition = function(k, r) {
        var o = r * 1000;
        var s = (k % o) / o;
        var u = c.parameters.path;
        var q = u.getPointAt(s);
        q.multiplyScalar(d);
        var m = c.tangents.length;
        var i = s * m;
        var n = Math.floor(i);
        var p = (n + 1) % m;
        e.subVectors(c.binormals[p], c.binormals[n]);
        e.multiplyScalar(i - n).add(c.binormals[n]);
        var j = u.getTangentAt(s);
        var l = 1;
        b.copy(e).cross(j);
        return q
    }
});
Class(function StarsElement(b) {
    var e = this;
    var g, a;
    var h;
    this.speed = 0.00001;
    this.mesh = null;
    (function() {
        Global.ELEMENTS.stars = e;
        c();
        i();
        f()
    })();

    function c() {
        g = new THREE.Scene();
        a = new THREE.PerspectiveCamera(45, 1280 / 720, 500, 100000)
    }

    function f() {
        e.mesh.position.x = 0
    }

    function d(j) {
        e.mesh.rotation.z = j * e.speed
    }

    function i() {
        var j = new Vector3();
        var o = new Matrix4();
        var n = new THREE.Geometry();
        var p = {
            map: {
                type: "t",
                value: THREE.ImageUtils.loadTexture(Config.IMAGES + "elements/common/particle.png")
            },
            size: {
                type: "f",
                value: 6
            }
        };
        var k = {
            alpha: {
                type: "f",
                value: []
            },
            scale: {
                type: "f",
                value: []
            }
        };
        var m = Device.mobile ? 500 : 3000;
        for (var l = 0; l < m; l++) {
            var q = new THREE.Vector3(0, 1, 0);
            j.set(1, 0, 0);
            o.identity().setRotation(0, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
            o.transformVector(j);
            j.multiply(1000);
            j.copyTo(q);
            k.alpha.value.push(Math.random() * 0.5 + 0.1);
            k.scale.value.push((Utils.doRandom(20, 50) / 10) * ContactDevice.pixelRatio);
            n.vertices.push(q)
        }
        var r = new THREE.ShaderMaterial({
            uniforms: p,
            attributes: k,
            vertexShader: Hydra.SHADERS["Stars.vs"],
            fragmentShader: Hydra.SHADERS["Stars.fs"]
        });
        r.depthWrite = false;
        r.transparent = true;
        r.depthTest = false;
        h = new THREE.ParticleSystem(n, r);
        e.mesh = h;
        g.add(h);
        h.scale.set(22, 22, 22)
    }
    this.setSize = function(j) {};
    this.render = function() {
        a.quaternion.copy(Data.CAMERA.worldCamera.quaternion);
        a.position.copy(Data.CAMERA.worldCamera.position);
        a.updateMatrixWorld();
        Global.RENDERER.render(g, a, b.renderTarget);
        a.position.copy(Data.CAMERA.worldCamera.position)
    };
    this.scale = function(k, j) {
        return;
        if (j) {
            h.scale.set(k, k, k);
            a.far = j;
            a.updateProjectionMatrix()
        }
    };
    this.reset = f;
    this.rotate = function() {
        Render.startRender(d)
    };
    this.stopRotate = function() {
        Render.stopRender(d)
    }
});
Class(function SunElement() {
    Inherit(this, BaseElement);
    var g = this;
    var k, d, a, h;
    var e = Date.now();
    this.mesh = new THREE.Object3D();
    (function() {
        j();
        b();
        l();
        f();
        c();
        g.addTo()
    })();

    function j() {
        k = new THREE.Object3D();
        g.mesh.add(k);
        i();
        g.object3D = k
    }

    function i() {
        k.position.x = 10500;
        k.scale.set(5, 5, 5)
    }

    function b() {
        var m = {
            time: {
                type: "f",
                value: 1
            },
            high: {
                type: "f",
                value: 55
            },
            mid: {
                type: "f",
                value: 40
            },
            range: {
                type: "f",
                value: 80
            },
            opacity: {
                type: "f",
                value: 1
            },
            color: {
                type: "c",
                value: new THREE.Color(4044031)
            },
            h: {
                type: "f",
                value: 0.1
            },
            l: {
                type: "f",
                value: 0.6
            },
            lightColor: {
                type: "c",
                value: new THREE.Color(16765284)
            },
            atmosphere: {
                type: "i",
                value: 0
            },
            solidColor: {
                type: "c",
                value: new THREE.Color(6710886)
            }
        };
        var n = new THREE.ShaderMaterial({
            uniforms: m,
            vertexShader: Hydra.SHADERS["Hedron.vs"],
            fragmentShader: Hydra.SHADERS["Hedron.fs"],
            wireframe: true
        });
        n.transparent = true;
        n.depthTest = true;
        n.shading = THREE.FlatShading;
        return n
    }

    function l() {
        if (Device.mobile) {
            return
        }
        d = {};
        var n = [{
            radius: 260,
            vertices: Device.mobile ? 1 : 3,
            white: false
        }];
        for (var o = 0; o < n.length; o++) {
            var p = n[o];
            var m = g.initClass(SunElementCore, b(), p.radius, p.vertices, p.white);
            d["t" + o] = m;
            k.add(m.mesh)
        }
    }

    function c() {
        var m = new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture("assets/images/glows/sun.png"),
            transparent: true,
            depthTest: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
        h = new THREE.Mesh(new THREE.PlaneGeometry(1800, 1800), m);
        h.position.z -= 5;
        k.add(h)
    }

    function f() {
        var n = b();
        n.shading = THREE.FlatShading;
        n.wireframe = false;
        n.uniforms.range.value = 0;
        n.uniforms.high.value = 0;
        n.uniforms.opacity.value = 1;
        var m = new THREE.IcosahedronGeometry(250, Device.mobile ? 1 : 2);
        var o = new THREE.Mesh(m, n);
        k.add(o);
        a = n
    }
    this.update = function(m) {
        if (d) {
            d.t0.update(m)
        }
        var n = (m - e) * 0.00025;
        h.quaternion.copy(Data.CAMERA.worldCamera.quaternion)
    };
    this.scaleOut = function() {
        TweenManager.tween(k.scale, {
            x: 0.001,
            y: 0.001,
            z: 0.001
        }, 2000, "easeInCubic", 700, function() {
            k.scale.set(1, 1, 1);
            g.hide()
        })
    };
    this.reset = i
});
Class(function SunElementCore(b, a, i, k) {
    Inherit(this, View);
    var h = this;
    var e, j;
    var d = Date.now();
    var c = ["x", "y", "z"];
    (function() {
        f();
        g()
    })();

    function g() {
        e = {};
        e.x = 0.0002;
        e.y = 0.0001;
        e.z = 0;
        e.vx = 0.001;
        e.vy = 0.001;
        e.vz = 0.00124
    }

    function f() {
        var l = new THREE.SphereGeometry(a, 35, Device.mobile ? 10 : 20);
        j = new THREE.Mesh(l, b);
        h.mesh = j;
        b.uniforms.range.value /= 2;
        if (k) {
            b.uniforms.solidColor.value = new THREE.Color(16777215);
            b.uniforms.range.value *= 2
        }
    }
    this.update = function(n) {
        var o = (n - d) * 0.00015;
        b.uniforms.time.value = o;
        for (var m = 0; m < 3; m++) {
            var l = c[m];
            switch (e[l]) {
                case 0:
                    j.rotation[l] += Math.cos(Math.sin(o * 0.25)) * e["v" + l];
                    break;
                case 1:
                    j.rotation[l] += Math.cos(Math.sin(o * 0.25)) * e["v" + l];
                    break;
                case 2:
                    j.rotation[l] += Math.cos(Math.cos(o * 0.25)) * e["v" + l];
                    break
            }
        }
    }
});
Class(function TitleElement(b, a, e) {
    Inherit(this, BaseElement);
    var f = this;
    var d;
    this.opacity = null;
    this.mesh = null;
    (function() {
        c();
        f.addTo()
    })();

    function c() {
        var g = new THREE.PlaneGeometry(a, e);
        var h = new TextureMaterial(Config.IMAGES + "titles/" + b).material;
        h.transparent = true;
        h.depthWrite = false;
        h.depthTest = false;
        h.blending = THREE.AdditiveBlending;
        d = new THREE.Mesh(g, h);
        f.inner = d;
        f.mesh = new THREE.Object3D();
        f.mesh.add(d);
        f.opacity = h.uniforms.opacity
    }
    this.orient = function(g, i, h) {
        d.position.x = g;
        d.position.y = i;
        d.scale.set(h, h, h)
    };
    this.rotate = function(g, i, h) {
        d.rotation.set(g, i, h)
    }
});
Class(function TrajectoryElement(a, e) {
    Inherit(this, BaseElement);
    this.mesh = null;
    this.uniforms = {
        trailStart: {
            type: "f",
            value: 0
        },
        trailEnd: {
            type: "f",
            value: 1
        },
        minOpacity: {
            type: "f",
            value: 0.1
        },
        maxOpacity: {
            type: "f",
            value: 1
        },
        hardness: {
            type: "f",
            value: 1
        },
        lightPosition: {
            type: "v3",
            value: new THREE.Vector3(0, -100, -100)
        },
        ambient: {
            type: "c",
            value: new THREE.Color(16777215),
        },
        bumpSaturation: {
            type: "i",
            value: 1
        }
    };
    var f = this;
    var d;
    (function() {
        if (e) {
            return
        }
        b();
        c();
        f.addTo()
    })();

    function c() {
        if (e) {
            return
        }
        f.mesh.position.multiplyScalar(0);
        f.mesh.scale.set(1, 1, 1);
        d.uniforms.minOpacity.value = 0;
        d.uniforms.maxOpacity.value = 1;
        d.wireframe = false
    }

    function b() {
        var r = Data.TRAJECTORY.getPath(a).tube;
        var h = Config.PATH_GEOMETRY[a].colors || Config.DEFAULT_TRAJECTORY_COLORS;
        var k = Config.PATH_GEOMETRY[a].colorStops;
        var w = [];
        var x = [];
        var s = [];
        var j, n;
        for (var m, q = 0, o = r.vertices.length; q < o; q++) {
            m = q / r.vertices.length;
            for (var u = 0; u < k.length; u++) {
                if (m < k[u]) {
                    prevStop = k[u - 1] || 0;
                    nextStop = k[u] || 1;
                    j = h[u - 1];
                    n = h[u];
                    if (!j) {
                        j = n
                    }
                    if (!n) {
                        n = j
                    }
                    break
                }
            }
            var v = Utils.convertRange(m, prevStop, nextStop, 0, 1);
            var p = new THREE.Vector3();
            p.copy(j);
            p.lerp(n, v);
            var g = r.parameters.path.getPointAt(m);
            w.push(m);
            x.push(p);
            s.push(g)
        }
        d = new THREE.ShaderMaterial({
            attributes: {
                time: {
                    type: "f",
                    value: w
                },
                color2: {
                    type: "v3",
                    value: x
                },
                center: {
                    type: "v3",
                    value: s
                }
            },
            uniforms: f.uniforms,
            vertexShader: Hydra.SHADERS["Trajectory.vs"],
            fragmentShader: Hydra.SHADERS["Trajectory.fs"],
            transparent: true,
            shading: THREE.FlatShading
        });
        f.material = d;
        f.mesh = new THREE.Mesh(r, d)
    }
    this.depthWrite = function(g) {
        if (e) {
            return
        }
        d.depthWrite = g
    };
    this.depthTest = function(g) {
        if (e) {
            return
        }
        d.depthTest = g
    };
    this.debug = function() {
        if (e) {
            return
        }
        f.uniforms.trailStart.value = 0;
        f.uniforms.trailEnd.value = 1
    };
    this.enableLight = function() {
        if (e) {
            return
        }
        this.uniforms.lightPosition.value.set(400, 100, 5000)
    };
    this.disableLight = function() {
        if (e) {
            return
        }
        this.uniforms.lightPosition.value.multiplyScalar(0)
    };
    this.reset = c
});
Class(function ErrorBasic() {
    Inherit(this, View);
    var d = this;
    var c;
    (function() {
        b();
        d.delayedCall(a, 200)
    })();

    function b() {
        c = d.element;
        c.size(600, 800).bg(Config.IMAGES + "error/error.png").invisible()
    }

    function a() {
        c.visible().css({
            opacity: 0
        }).transform({
            scale: 0.9
        }).tween({
            opacity: 1,
            scale: 1
        }, 800, "easeOutCubic")
    }
});
Class(function ErrorChrome() {
    Inherit(this, View);
    var f = this;
    var e;
    var b;
    (function() {
        c();
        d();
        f.delayedCall(a, 200)
    })();

    function c() {
        e = f.element;
        e.size(600, 800).bg(Config.IMAGES + "error/chrome.png").invisible()
    }

    function d() {
        b = f.initClass(GhostButton, {
            width: 230,
            text: "Get Chrome"
        });
        b.element.center(1, 0).css({
            top: 640
        })
    }

    function a() {
        e.visible().css({
            opacity: 0
        }).transform({
            scale: 0.9
        }).tween({
            opacity: 1,
            scale: 1
        }, 800, "easeOutCubic");
        b.animateIn()
    }
});
Class(function ErrorLandscape() {
    Inherit(this, View);
    var g = this;
    var e, d;
    (function() {
        c();
        b();
        g.delayedCall(a, 200)
    })();

    function c() {
        e = g.element;
        e.size(600, 800).bg(Config.IMAGES + "error/landscape.png").invisible()
    }

    function b() {
        d = e.create(".spin");
        d.rotate = 0;
        d.size(256, 201).center(1, 0).css({
            top: 30
        }).bg(Config.IMAGES + "error/spin.png")
    }

    function a() {
        e.visible().css({
            opacity: 0
        }).transform({
            scale: 0.9
        }).tween({
            opacity: 1,
            scale: 1
        }, 800, "easeOutCubic");
        g.delayedCall(f, 1000)
    }

    function f() {
        d.rotate += 90;
        d.tween({
            rotation: d.rotate
        }, 600, "easeInOutCubic");
        g.delayedCall(f, 2000)
    }
});
Class(function ErrorWebgl() {
    Inherit(this, View);
    var e = this;
    var h;
    var a, f;
    (function() {
        b();
        c();
        g();
        e.delayedCall(i, 400)
    })();

    function b() {
        h = e.element;
        h.size(600, 800).bg(Config.IMAGES + "error/webgl.png").invisible()
    }

    function c() {
        a = e.initClass(GhostButton, {
            width: 290,
            height: 54,
            text: "Download Chrome"
        });
        a.element.center(1, 0).css({
            top: 570
        });
        f = e.initClass(GhostButton, {
            width: 370,
            height: 54,
            text: "Continue without chrome"
        });
        f.element.center(1, 0).css({
            top: 650
        })
    }

    function i() {
        h.visible().css({
            opacity: 0
        }).transform({
            scale: 0.9
        }).tween({
            opacity: 1,
            scale: 1
        }, 1000, "easeOutCubic", 100);
        a.animateIn();
        f.animateIn()
    }

    function g() {
        f.events.add(HydraEvents.CLICK, j);
        a.events.add(HydraEvents.CLICK, d)
    }

    function j() {
        DeviceError.instance().hide()
    }

    function d() {
        getURL("http://chrome.com", "_blank")
    }
});
Class(function FooterMobileMenu() {
    Inherit(this, View);
    var i = this;
    var m, o;
    var p;
    var j = [];
    var a = [];
    i.show_menu = false;
    (function() {
        e();
        c();
        n();
        f();
        k();
        b()
    })();

    function e() {
        m = i.element;
        m.size("100%", 50).setZ(10)
    }

    function c() {
        var q = Math.max(Stage.width, Stage.height);
        Global.MENU_WIDTH = q * 0.2;
        if (Global.MENU_WIDTH < 120) {
            Global.MENU_WIDTH = 120
        }
        p = i.initClass(FooterNavButton, {
            type: "MAIN MENU",
            width: Global.MENU_WIDTH
        });
        p.resize(50);
        p.toggle = true;
        p.back.bg(Config.IMAGES + "colors/fff.png");
        var r = m.create("divide");
        r.size(1, 50).css({
            left: Global.MENU_WIDTH,
            borderLeft: "1px solid #333"
        })
    }

    function n() {
        o = m.create(".arrow");
        o.size(8, 8).css({
            top: 22,
            left: Global.MENU_WIDTH - 4,
            opacity: 0
        }).setZ(10).transform({
            rotation: 45,
            x: -5
        }).bg("#fff")
    }

    function f() {
        var t = Data.TIMELINE.getData();
        var s = 0;
        for (var r = t.length - 1; r > -1; r--) {
            var u = t[r];
            u.width = 80;
            u.type = u.text || "NONE";
            u.index = r;
            var q = i.initClass(FooterNavButton, u);
            q.css({
                right: s
            });
            q.resize(50);
            q.date = true;
            j[r] = q;
            s += t[r].width;
            var v = m.create("divide");
            v.size(1, 50).css({
                right: s - 1,
                borderRight: "1px solid #333"
            });
            if (r == t.length - 1) {
                v.css({
                    borderRight: "none"
                })
            }
            a[r] = v;
            s += 1
        }
    }

    function l() {
        m.mouseEnabled(true);
        for (var q = 0; q < j.length; q++) {
            j[q].element.stopTween().tween({
                y: 0
            }, 600, "easeOutQuart", q * 40 + 200);
            a[q].stopTween().tween({
                y: 0
            }, 500, "easeInOutCubic", q * 40)
        }
    }

    function h() {
        m.mouseEnabled(false);
        for (var q = 0; q < j.length; q++) {
            j[q].element.stopTween().tween({
                y: -50
            }, 500, "easeOutCubic", q * 20 + 20);
            a[q].stopTween().tween({
                y: 50
            }, 400, "easeOutCubic", q * 20)
        }
    }

    function k() {
        p.events.add(HydraEvents.CLICK, d);
        i.events.add(ContactEvents.RESIZE, b);
        for (var q = 0; q < j.length; q++) {
            j[q].events.add(HydraEvents.CLICK, g)
        }
    }

    function d() {
        if (i.show_menu) {
            i.show_menu = false;
            p.deactivate();
            l();
            p.text.css({
                color: "#fff"
            });
            o.tween({
                opacity: 0,
                x: -5,
                rotation: 45
            }, 100, "easeOutSine");
            i.events.fire(HydraEvents.CLICK, {
                on: false
            })
        } else {
            i.show_menu = true;
            p.activate();
            h();
            o.tween({
                opacity: 1,
                x: 0,
                rotation: 45
            }, 300, "easeOutCubic", 100);
            p.text.css({
                color: "#000"
            });
            i.events.fire(HydraEvents.CLICK, {
                on: true
            })
        }
    }

    function g(q) {
        if (Global.WRAPPER_UP) {
            i.events.fire(ContactEvents.NAV_CLICK, {
                type: "journey"
            })
        }
        i.events.fire(ContactEvents.TIMELINE_SEEK, q)
    }

    function b() {
        var t = Stage.width - Global.MENU_WIDTH - j.length + 4;
        var s = t / j.length;
        var r = 0;
        for (var q = j.length - 1; q > -1; q--) {
            j[q].css({
                width: s,
                right: r
            });
            a[q].css({
                right: r - 1
            });
            r += s
        }
    }
    this.resize = b;
    this.animateIn = function() {
        if (i.show_menu) {
            d()
        }
    }
});
Class(function FooterNavButton(b) {
    Inherit(this, View);
    var g = this;
    var j, l, h, c, m;
    g.height = 40;
    (function() {
        e();
        k();
        if (b.icon) {
            a()
        } else {
            d()
        }
        i()
    })();

    function e() {
        j = g.element;
        j.css({
            height: "100%",
            width: b.width,
            overflow: "hidden"
        });
        c = j.create(".bg");
        c.size("100%").bg(Config.IMAGES + "colors/333.png").transform({
            opacity: 0.7
        }).transform({
            y: 50
        });
        g.back = c
    }

    function k() {
        m = j.create(".arrow");
        m.size(8, 8).center(0, 1).css({
            right: -5,
            opacity: 0
        }).transform({
            rotation: 45
        })
    }

    function a() {
        h = j.create(".icon");
        h.size(20, 20).bg(Config.IMAGES + "footer/icons/" + b.type + ".png").center().css({
            opacity: 0.7
        })
    }

    function d() {
        l = j.create(".text");
        l.fontStyle("GravurCondensed", 14, "#fff");
        l.css({
            width: "100%",
            textTransform: "uppercase",
            textAlign: "center",
            top: "50%",
            marginTop: -7,
            letterSpacing: 2,
            opacity: 0.7
        });
        if (Mobile.phone) {
            l.div.className = "copy";
            l.css({
                fontFamily: "Tungsten",
                fontSize: 22,
                letterSpacing: 1,
                top: "50%",
                marginTop: -11,
            })
        }
        l.text(b.type);
        g.text = l
    }

    function i() {
        j.interact(f, n);
        if (b.type == "google") {
            ContactUtil.initGoogleShare()
        }
        j.hit.transform({
            z: 1
        }).mouseEnabled(true)
    }

    function f(o) {
        if ((g.active || Global.NAV_DISABLED) && !o.force) {
            return
        }
        switch (o.action) {
            case "over":
                if (l) {
                    l.tween({
                        opacity: 1
                    }, 100, "easeOutSine")
                }
                if (h) {
                    h.tween({
                        opacity: 1
                    }, 100, "easeOutSine")
                }
                c.stopTween().transform({
                    y: g.height
                }).tween({
                    y: 0,
                    opacity: 0.7
                }, 300, "easeOutCirc");
                break;
            case "out":
                if (h) {
                    h.tween({
                        opacity: 0.7
                    }, 200, "easeOutSine")
                }
                if (l) {
                    l.tween({
                        opacity: 0.7
                    }, 200, "easeOutSine")
                }
                c.tween({
                    y: g.height,
                    opacity: 0.7
                }, 500, "easeOutCirc");
                break
        }
    }

    function n() {
        if (g.active && b.type == "data") {
            g.events.fire(ContactEvents.DATA_CLOSE)
        }
        if (g.active && !g.toggle || Global.NAV_DISABLED) {
            return
        }
        c.tween({
            opacity: 1,
            y: 0
        }, 50, "easeOutSine");
        if (Device.mobile) {
            f({
                action: "out"
            })
        }
        if (g.toggle || g.date || b.icon) {
            g.events.fire(HydraEvents.CLICK, b)
        } else {
            g.events.fire(ContactEvents.NAV_CLICK, b)
        }
    }
    this.resize = function(o) {
        g.height = o;
        if (!g.active) {
            c.stopTween().tween({
                y: g.height,
                opacity: 0.7
            }, 500, "easeOutSine")
        }
    };
    this.activate = function() {
        g.active = true;
        c.tween({
            opacity: 1,
            y: 0
        }, 200, "easeOutSine")
    };
    this.deactivate = function() {
        g.active = false;
        f({
            action: "out",
            force: true
        })
    }
});
Class(function FooterNavView() {
    Inherit(this, View);
    var d = this;
    var h;
    var k;
    d.height = Mobile.phone ? 50 : 40;
    var i = [{
        type: "journey",
        width: 120
    }, {
        type: "data",
        width: 95
    }, {
        type: "about",
        width: 100
    }, {
        type: "google",
        width: 60,
        icon: true
    }, {
        type: "facebook",
        width: 60,
        icon: true
    }, {
        type: "twitter",
        width: 60,
        icon: true
    }];
    if (ContactDevice.WEBGL) {
        i.splice(1, 0, {
            type: "live",
            width: 90
        })
    }
    var e = [];
    var a = [];
    (function() {
        b();
        c();
        f()
    })();

    function b() {
        h = d.element;
        h.css({
            right: 0,
            height: "100%",
            top: 0,
            overflow: "hidden"
        }).mouseEnabled(false)
    }

    function c() {
        var o = 0;
        var l = 0;
        for (var n = 0; n < i.length; n++) {
            l += i[n].width
        }
        for (var n = i.length - 1; n > -1; n--) {
            var p = i[n];
            p.index = n;
            var m = d.initClass(FooterNavButton, p);
            m.widthPerc = i[n].width / l;
            m.type = i[n].type;
            m.css({
                right: o
            }).transform({
                y: d.height
            });
            m.events.add(HydraEvents.CLICK, g);
            e[n] = m;
            o += i[n].width;
            var q = h.create("divide");
            q.size(1, 50).css({
                height: "100%",
                right: o - 1,
                borderLeft: "1px solid #333"
            }).transform({
                y: -d.height
            });
            a[n] = q;
            o += 1
        }
        k = e[0];
        h.css({
            width: o + 1
        })
    }

    function f() {
        d.events.subscribe(ContactEvents.NAV_CLICK, g);
        d.events.subscribe(ContactEvents.HOMEPAGE, j)
    }

    function j() {
        if (k) {
            k.deactivate()
        }
        k = e[0];
        if (k) {
            Global.ACTIVE_PAGE = "journey";
            k.activate()
        }
    }

    function g(m) {
        switch (m.type) {
            case "journey":
                GATracker.trackEvent("clickable_link", "landing_page", "journey");
                break;
            case "data":
                GATracker.trackEvent("clickable_link", "landing_page", "data");
                break;
            case "about":
                GATracker.trackEvent("clickable_link", "landing_page", "about ");
                break;
            case "facebook":
                GATracker.trackEvent("clickable_link", "landing_page", "facebook_share");
                break;
            case "twitter":
                GATracker.trackEvent("clickable_link", "landing_page", "twitter_share");
                break;
            case "google":
                GATracker.trackEvent("clickable_link", "landing_page", "gplus_share");
                break
        }
        if (m.icon) {
            ContactUtil.popup(m.type)
        } else {
            Global.NAV_DISABLED = true;
            d.delayedCall(function() {
                Global.NAV_DISABLED = false
            }, 2000);
            if (k) {
                k.deactivate()
            }
            for (var l = 0; l < e.length; l++) {
                if (e[l].type == m.type) {
                    k = e[l]
                }
            }
            if (k) {
                Global.ACTIVE_PAGE = m.type;
                k.activate()
            }
        }
    }
    this.resize = function(m) {
        d.height = m;
        var o = 0;
        var l = Stage.width - Global.MENU_WIDTH - e.length;
        for (var n = e.length - 1; n > -1; n--) {
            e[n].resize(m);
            if (Mobile.phone) {
                var p = l * e[n].widthPerc;
                e[n].css({
                    width: p,
                    right: o
                });
                o += p;
                a[n].css({
                    right: n == 0 ? 0 : o - 1
                });
                o += 1
            }
        }
        if (Mobile.phone) {
            h.css({
                width: o + 1
            })
        }
    };
    this.animateIn = function() {
        for (var l = 0; l < e.length; l++) {
            e[l].element.stopTween().tween({
                y: 0
            }, 600, "easeOutQuart", l * 40 + 200);
            a[l].stopTween().tween({
                y: 0
            }, 500, "easeInOutCubic", l * 40)
        }
        d.delayedCall(k.activate, 500)
    };
    this.animateOut = function() {
        for (var l = 0; l < e.length; l++) {
            e[l].element.stopTween().tween({
                y: d.height
            }, 500, "easeOutCubic", l * 20 + 20);
            a[l].stopTween().tween({
                y: -d.height
            }, 400, "easeOutCubic", l * 20)
        }
        d.delayedCall(k.deactivate, 200)
    }
});
Class(function FooterTitleView() {
    Inherit(this, View);
    var h = this;
    var g, b;
    (function() {
        e();
        a();
        d()
    })();

    function e() {
        g = h.element;
        g.size(200, 50).css({
            height: "100%"
        })
    }

    function a() {
        b = g.create(".logo");
        b.size(192, 17).center(0, 1).css({
            left: 13,
            opacity: 0.7
        }).bg(Config.IMAGES + "footer/logo.png")
    }

    function d() {
        g.interact(c, f);
        g.hit.css({
            cursor: "default"
        })
    }

    function c(i) {
        if (Global.CHAPTER_SEEK || Global.HOME_PAGE) {
            return
        }
        switch (i.action) {
            case "over":
                g.hit.css({
                    cursor: "pointer"
                });
                b.tween({
                    opacity: 1
                }, 200, "easeOutSine");
                break;
            case "out":
                g.hit.css({
                    cursor: "default"
                });
                b.tween({
                    opacity: 0.7
                }, 200, "easeOutSine");
                break
        }
    }

    function f() {
        if (Global.CHAPTER_SEEK || Global.HOME_PAGE) {
            return
        }
        c({
            action: "out"
        });
        h.events.fire(ContactEvents.HOMEPAGE)
    }
});
Class(function IntroView(w) {
    Inherit(this, View);
    var r = this;
    var h, m, v, e;
    var j, t, b;
    var f = 750;
    (function() {
        l();
        if (!Mobile.phone && Config.HANGOUT) {
            c()
        }
        o();
        q();
        if (!w) {
            i()
        }
        if (ContactDevice.WEBGL) {
            d()
        }
        n();
        if (w) {
            r.delayedCall(p, 200)
        }
    })();

    function l() {
        h = r.element;
        h.size("100%").setZ(10000).invisible();
        h.wrapper = h.create(".wrapper");
        h.wrapper.size(1000, 300).css({
            left: "50%",
            top: "50%"
        }).transformPoint(0, 0);
        if (Mobile.phone) {
            h.wrapper.css({
                left: "10%",
                top: "22%"
            });
            if (!ContactDevice.WEBGL && Config.HANGOUT) {
                e = h.create(".banner", "a");
                e.size("100%", 38).bg("#108854").css({
                    top: 0,
                    right: 0
                }).transform({
                    y: -38
                });
                e.inner = e.create(".inner");
                e.inner.size(355, 27).bg(Config.IMAGES + "intro/banner.png").center()
            }
        }
    }

    function c() {
        b = r.initClass(HangoutCallout)
    }

    function o() {
        m = h.wrapper.create(".title");
        m.size(f, 90).css({
            overflow: "hidden",
            opacity: 0
        }).transform({
            y: 30
        });
        m.inner = m.create(".inner");
        m.inner.fontStyle("Tungsten", 70, "#fff");
        m.inner.text("A SPACECRAFT FOR ALL");
        m.inner.css({
            letterSpacing: 5,
            whiteSpace: "nowrap"
        })
    }

    function q() {
        v = h.wrapper.create(".title");
        v.size(1000, 100).css({
            overflow: "hidden",
            top: 85,
            opacity: 0
        }).transform({
            y: 30
        });
        v.inner = v.create(".copy");
        v.inner.fontStyle("GravurCondensed", 18, "#fff");
        v.inner.html("The ISEE-3 was launched to study the Sun in 1978, but ended up redefining space flight. Now itâ€™s on a new mission to become citizen scienceâ€™s first spacecraft, with data accessible by everyone.");
        v.inner.css({
            lineHeight: 26,
            fontWeight: "light",
            width: 570
        })
    }

    function i() {
        j = r.initClass(GhostButton, {
            width: 220,
            text: w ? "Continue Journey" : "See the Journey"
        }, null);
        h.wrapper.addChild(j);
        j.css({
            top: 185,
            left: 0
        })
    }

    function d() {
        t = r.initClass(GhostButton, {
            width: 186,
            text: "See Live View"
        }, null);
        h.wrapper.addChild(t);
        t.css({
            top: 185,
            left: 240
        })
    }

    function p() {
        u();
        h.visible();
        m.tween({
            y: 0,
            opacity: 1
        }, 600, "easeOutCubic", 100);
        v.tween({
            y: 0,
            opacity: 1
        }, 600, "easeOutCubic", 200);
        if (e) {
            e.tween({
                y: 0
            }, 600, "easeOutCubic", 400)
        }
        if (j) {
            j.animateIn()
        }
        if (t) {
            r.delayedCall(t.animateIn, 100)
        }
        if (b) {
            r.delayedCall(b.animateIn, 200)
        }
    }

    function k() {
        if (Device.mobile) {
            Device.openFullscreen()
        }
        m.tween({
            y: -30,
            opacity: 0
        }, 400, "easeInSine");
        v.tween({
            y: -30,
            opacity: 0
        }, 400, "easeInSine", 80);
        j.animateOut();
        if (t) {
            t.animateOut()
        }
        if (b) {
            b.animateOut()
        }
    }

    function n() {
        if (j) {
            j.events.add(HydraEvents.CLICK, s)
        }
        if (t) {
            t.events.add(HydraEvents.CLICK, a)
        }
        r.events.subscribe(ContactEvents.RESIZE, u);
        if (e) {
            e.interact(null, g);
            e.hit.css({
                height: 100
            })
        }
    }

    function g() {
        var x = "http://youtu.be/" + Config.HANGOUT_ID;
        window.location = x
    }

    function s() {
        k();
        r.events.fire(ContactEvents.BEGIN);
        r.delayedCall(function() {
            r.destroy()
        }, 800);
        GATracker.trackEvent("clickable_link", "landing_page", "see_the_journey")
    }

    function a() {
        k();
        r.events.fire(ContactEvents.BEGIN, {
            live: true
        });
        r.events.fire(ContactEvents.NAV_CLICK, {
            type: "live",
            index: 1
        });
        r.delayedCall(function() {
            r.destroy()
        }, 800);
        GATracker.trackEvent("clickable_link", "landing_page", "see_live_view")
    }

    function u() {
        var y = Stage.width < 1250 ? Stage.width / 1250 : 1;
        h.wrapper.scale = Mobile.phone ? y * 1.75 : y;
        if (h.wrapper.scale > 1) {
            h.wrapper.scale = 1
        }
        h.wrapper.transform();
        var x = Global.VIDEO_TOP_Y || 0;
        if (x < 0) {
            x = 0
        }
        if (b) {
            b.element.css({
                top: x + 35,
                right: 35
            }).transformPoint("100%", "0%");
            b.element.scale = Stage.height < 550 ? Stage.height / 550 : 1;
            b.element.transform()
        }
    }
    this.animateIn = function() {
        u();
        p()
    }
});
Class(function LoaderView() {
    Inherit(this, View);
    var r = this;
    var f, w, b, s, c, m, i;
    var l = Device.mobile ? 0.8 : 0.9;
    var j, d, p, a, e;
    var t = new Vector2();
    var h = new Vector2();
    h.x = 0;
    t.x = 0.2;
    (function() {
        n();
        v();
        k();
        if (ContactDevice.WEBGL) {
            g()
        }
        Render.startRender(u)
    })();

    function n() {
        f = r.element;
        f.perc = 0;
        f.size("100%").invisible()
    }

    function v() {
        c = f.create(".bg");
        c.size("100%").bg("#000");
        w = f.create("top");
        w.size("100%", "50%").bg("#000").setZ(3).css({
            top: "0%"
        });
        m = f.create("bottom");
        m.size("100%", "50%").bg("#000").setZ(3).css({
            top: "50%"
        })
    }

    function g() {
        s = f.create(".text");
        s.fontStyle("GravurCondensed", 18, "#fff");
        s.text(Global.LIVE_LOAD ? "CLICK AND DRAG TO EXPLORE" : "MOVE YOUR CURSOR TO EXPLORE");
        s.shrink = Mobile.phone ? 0.6 : Device.mobile ? 0.8 : 1;
        s.css({
            bottom: "5%",
            width: "100%",
            textAlign: "center",
            letterSpacing: 1
        }).setZ(5);
        b = s.create(".icon");
        b.size(52, 52).center(1, 0).css({
            top: -80
        }).bg(Config.IMAGES + "common/move.png").setZ(10);
        e = r.initClass(CSSAnimation, b);
        e.loop = true;
        e.duraton = 4000;
        e.ease = "easeInOutCubic";
        e.direction = "alternate";
        e.frames = [{
            x: -40
        }, {
            x: 40
        }];
        b.div.style[CSS.prefix("AnimationDirection")] = "alternate"
    }

    function k() {
        var y = 200;
        i = f.create(".circle");
        i.size(y, y).center().setZ(10).transform({
            rotation: -90,
            scale: Mobile.phone ? 0.6 : 1
        });
        p = r.initClass(Canvas, y, y, Device.mobile);
        p.size = y;
        i.addChild(p);
        a = r.initClass(CanvasGraphics);
        a.lineWidth = Math.round(y * 0.04);
        a.lineCap = "round";
        p.add(a);
        a.strokeStyle = "#02e6c8";
        var x = new Image();
        x.src = Config.IMAGES + "common/gradient.png";
        x.width = y;
        x.height = y;
        x.onload = function() {
            a.strokeStyle = p.context.createPattern(x, "repeat");
            r.delayedCall(q, 300)
        }
    }

    function q() {
        f.visible();
        if (e) {
            e.play()
        }
        TweenManager.tween(f, {
            perc: 0.3
        }, 500, "easeInOutCubic");
        if (s) {
            s.css({
                opacity: 0
            }).transform({
                y: 15,
                scale: s.shrink
            }).tween({
                y: 0,
                scale: s.shrink,
                opacity: 1
            }, 500, "easeOutCubic")
        }
        r.delayedCall(function() {
            r.loading = true;
            r.events.fire(HydraEvents.READY)
        }, 500)
    }

    function u(x, y) {
        if (y < 30) {
            return
        }
        if (!r.completed && r.loading) {
            h.lerp(t, 0.015);
            f.perc = 0.3 + h.x * 0.85;
            if (f.perc > 1) {
                f.perc = 1
            }
        }
        a.clear();
        a.arc(p.size / 2, p.size / 2, f.perc * 360, p.size * 0.45);
        a.stroke();
        p.render();
        if (!r.completed && r.loaded) {
            r.completed = true;
            if (s) {
                s.tween({
                    y: 15,
                    scale: s.shrink,
                    opacity: 0
                }, 400, "easeInSine", function() {
                    e.stop()
                })
            }
            TweenManager.tween(f, {
                perc: 1
            }, 800, "easeInOutQuart");
            r.delayedCall(o, 600)
        }
    }

    function o() {
        r.loading = false;
        i.tween({
            opacity: 0,
            scale: Mobile.phone ? 0.5 : 0.9
        }, 400, "easeInSine", Global.FULL_PEEL ? 400 : 0);
        if (Global.FULL_PEEL) {
            w.remove();
            m.remove()
        }
        var z = Global.VIDEO_TOP_Y || 0;
        var x = Global.FULL_PEEL ? 1000 : 400;
        var y = Global.FULL_PEEL ? 800 : 1200;
        if (w) {
            w.tween({
                y: -Stage.height / 2 + z
            }, y, "easeInOutQuint", x)
        }
        if (m) {
            m.tween({
                y: Stage.height / 2 - z
            }, y, "easeInOutQuint", x)
        }
        c.css({
            opacity: 1
        }).tween({
            opacity: 0
        }, y, "easeInOutSine", x);
        r.delayedCall(function() {
            Render.stopRender(u);
            j()
        }, x + y)
    }
    this.update = function(x) {
        t.x = 0.3 + x * 0.7
    };
    this.animateOut = function(y, x) {
        j = y;
        d = x;
        r.loaded = true
    };
    this.fill = function() {
        l = 1
    }
});
Class(function ANewOrbit() {
    Inherit(this, TimeController);
    var p = this;
    var m, d, o, q, t;
    var a, j, b;
    var h, i;
    var g = Global.INIT_MOMENT.strpos("aneworbit") || Global.CHAPTER_SEEK;
    var e = -30;
    var f = Utils.toRadians(180);
    var u = p.initClass(DynamicObject, {
        v: 0.002,
        t: 0.000003
    });
    (function() {
        if (g) {
            Global.ELEMENTS.hideAll()
        }
        s();
        n();
        Data.SHOTS.initShot("ANewOrbitShot");
        Render.startRender(r);
        p.delayedCall(l, g ? 1 : 100);
        Global.ELEMENTS.video.setOpacity(0);
        Data.CHAPTERS.listen(8.2622, k)
    })();

    function s() {
        m = Global.ELEMENTS.earth;
        d = Global.ELEMENTS.sun;
        p.delayedCall(function() {
            Global.STATE_MODEL.replaceState("a-new-orbit")
        }, 3000);
        o = Global.ELEMENTS.trajectorySmooth;
        o.uniforms.minOpacity.value = 0;
        o.show();
        o.depthWrite(true);
        o.depthTest(true);
        o.mesh.position.set(0, 0, 0);
        o.mesh.rotation.set(0, 0, 0);
        o.mesh.scale.set(1, 1, 1);
        o.uniforms.hardness.value = 1;
        if (g) {
            TweenManager.clearTween(o.uniforms.trailStart);
            TweenManager.clearTween(o.uniforms.trailEnd);
            p.delayedCall(function() {
                o.uniforms.trailStart.value = 0;
                o.uniforms.trailEnd.value = 0.009
            }, 250)
        }
        o.uniforms.trailEnd.value = 0.009;
        q = Global.ELEMENTS.stars;
        q.scale(10);
        q.mesh.position.x = 0;
        q.setSize(100);
        a = Global.ELEMENTS.satellite;
        a.satellite.scale.set(0.2, 0.2, 0.2);
        a.mesh.scale.set(0.001, 0.001, 0.001);
        a.show();
        a.color(8847141, 0.15);
        a.edgeWidth(2);
        Data.TRAJECTORY.orient("satellite_smooth", a.mesh, 0, u.v, f, 1);
        var v = [m.mesh, o, o.mesh, a.mesh, a.satellite];
        if (g) {
            v.push(d.mesh);
            v.push(d.object3D)
        }
        ContactUtil.clearTweens(v)
    }

    function n() {
        j = Global.ELEMENTS.title1;
        j.show();
        j.orient(-110, -50, 0.15);
        j.opacity.value = 0;
        j.rotate(Utils.toRadians(-28), 0, 0);
        j.time = 0.0075;
        Data.TRAJECTORY.orient("satellite_smooth", j.mesh, e, j.time, f, 0.9)
    }

    function l() {
        p.tween(TweenManager.tween(a.mesh.scale, {
            x: 1,
            y: 1,
            z: 1
        }, 500, "easeOutCubic", 2000));
        o.uniforms.maxOpacity.value = 0;
        p.tween(TweenManager.tween(o.uniforms.maxOpacity, {
            value: 0.7
        }, 6000, "easeInSine", 1000));
        p.tween(TweenManager.tween(j.opacity, {
            value: 0.9
        }, 3500, "easeOutSine", 3000, function() {
            p.tween(TweenManager.tween(j.opacity, {
                value: 0
            }, 1500, "easeOutSine"))
        }));
        if (Global.SHOT.ANewOrbitShot && typeof Global.SHOT.ANewOrbitShot.setTimers === "function") {
            Global.SHOT.ANewOrbitShot.setTimers()
        }
    }

    function r() {
        if (u.v > 0.009) {
            o.uniforms.trailEnd.value = u.v + 0.001
        }
        u.v += u.t;
        Data.TRAJECTORY.orient("satellite_smooth", a.mesh, e, u.v, f)
    }

    function c() {
        Global.SCENE_VIEW.hide();
        d.hide();
        o.hide();
        a.hide();
        j.hide();
        Render.stopRender(r)
    }

    function k() {
        Global.ELEMENTS.video.fade(1, 2000, "easeOutSine")
    }
    this.animateOut = function() {
        t = true;
        Render.stopRender(r);
        p.tween(TweenManager.tween(o.uniforms.trailEnd, {
            value: u.v
        }, 2000, "easeInOutCubic"))
    };
    this.pause = function() {
        Render.stopRender(r);
        this._pause()
    };
    this.resume = function() {
        Render.startRender(r);
        this._resume()
    };
    this.end = function() {
        c();
        Data.SHOTS.remove(Global.SHOT.ANewOrbitShot);
        Data.MOMENTS.remove(p)
    };
    this.destroy = function() {
        c();
        return this._destroy()
    }
});
Class(function L1Demo() {
    Inherit(this, TimeController);
    var q = this;
    var g, o, e, p, t, b, s;
    var d, a;
    var u = q.initClass(DynamicObject, {
        v: 0
    });
    var h = q.initClass(DynamicObject, {
        v: 0
    });
    (function() {
        v();
        n();
        Data.SHOTS.initShot("L1DemoShot");
        if (Global.PREVIEW) {
            Global.SHOT.L1DemoShot.activate()
        }
    })();

    function v() {
        Global.SCENE_VIEW.hide();
        var z = 800;
        g = Global.ELEMENTS.sun;
        g.show();
        g.object3D.position.set(2000, z, Number.POSITIVE_INFINITY);
        o = Global.ELEMENTS.earth;
        o.show();
        o.spaceOut();
        o.mesh.position.set(-2000, z, Number.POSITIVE_INFINITY);
        p = Global.ELEMENTS.trajectorySmooth;
        p.mesh.position.set(-2000, z, 0);
        p.mesh.scale.set(0.8, 0.8, 0.8);
        p.show();
        p.uniforms.minOpacity.value = 0;
        p.uniforms.trailStart.value = 0;
        p.uniforms.trailEnd.value = 0;
        p.uniforms.maxOpacity.value = 0;
        p.uniforms.hardness.value = 1;
        p.depthTest(true);
        p.depthWrite(true);
        t = Global.ELEMENTS.stars;
        t.mesh.position.x = 0;
        t.scale(15, 50000);
        s = Global.ELEMENTS.dot;
        s.mesh.position.set(-900, 800, Number.POSITIVE_INFINITY);
        s.mesh.scale.set(0.01, 0.01, 0.01);
        s.show();
        b = Global.ELEMENTS.satelliteSmall;
        b.mesh.scale.set(1, 1, 1);
        b.satellite.scale.set(1, 1, 1);
        if (Global.PREVIEW) {
            o.mesh.scale.set(2, 2, 2);
            g.object3D.scale.set(2, 2, 2);
            g.object3D.position.set(2000, 0, 0);
            o.mesh.position.set(-2000, 0, 0);
            s.mesh.position.set(-900, 0, 0);
            s.mesh.scale.set(1, 1, 1);
            p.mesh.position.y = 0;
            l()
        }
        b.speed = 0.05;
        var x = [o.mesh, p, p.mesh, b.mesh, b.satellite, s.mesh, g.mesh, g.object3D];
        ContactUtil.clearTweens(x)
    }

    function m() {
        if (d) {
            return
        }
        p.uniforms.trailStart.value = 0;
        p.uniforms.trailEnd.value = 0;
        p.uniforms.maxOpacity.value = 1;
        u.stopTween();
        h.stopTween();
        u.v = 0;
        h.v = 0.06;
        q.tween(u.tween({
            v: 0.5
        }, 12000, "easeInSine", c));
        q.tween(h.tween({
            v: 0
        }, 4000, "easeInSine", 8000))
    }

    function l() {
        if (a) {
            return
        }
        b.show();
        p.uniforms.trailStart.value = 0;
        p.uniforms.trailEnd.value = 0;
        u.stopTween();
        h.stopTween();
        u.v = 0.1;
        h.v = 0.06;
        q.tween(u.tween({
            v: 0.5
        }, 50000, "linear", c));
        q.tween(h.tween({
            v: 0
        }, 2000, "easeInSine", 30500));
        q.tween(TweenManager.tween(p.uniforms.maxOpacity, {
            value: 1
        }, 1000, "easeInSine"));
        q.delayedCall(function() {
            if (!q.tween) {
                return
            }
            q.tween(TweenManager.tween(p.uniforms.maxOpacity, {
                value: 0
            }, 1000, "easeOutSine", l))
        }, 30500)
    }

    function c() {
        p.uniforms.trailStart.value = u.v;
        p.uniforms.trailEnd.value = u.v - h.v;
        b.mesh.position.z = 0;
        Data.TRAJECTORY.orient("satellite_smooth", b.mesh, 0, u.v, 0, 1);
        b.mesh.position.x -= 2280;
        b.opacity = p.uniforms.maxOpacity.value
    }

    function n() {
        Data.CHAPTERS.listen(59.2597, r);
        Data.CHAPTERS.listen(62.1, i);
        Data.CHAPTERS.listen(63.4877, f);
        Data.CHAPTERS.listen(64.2, m);
        Data.CHAPTERS.listen(66.8, k);
        Data.CHAPTERS.listen(75.1898, j);
        Data.CHAPTERS.listen(81.2255, w)
    }

    function r() {
        Data.CAMERA.reset();
        Global.SCENE.video.setReveal(0.9);
        Global.SCENE.video.setRevealStrength(0.75);
        Global.SCENE_VIEW.show()
    }

    function i() {
        g.object3D.position.z = 0;
        g.object3D.scale.set(0.5, 0.5, 0.5);
        q.tween(TweenManager.tween(g.object3D.scale, {
            x: 2,
            y: 2,
            z: 2
        }, 1000, "easeOutCubic"))
    }

    function k() {
        s.mesh.position.z = 0;
        TweenManager.tween(s.mesh.scale, {
            x: 1,
            y: 1,
            z: 1
        }, 1500, "easeOutCubic")
    }

    function f() {
        o.mesh.position.z = 0;
        o.object3D.scale.set(0.5, 0.5, 0.5);
        q.tween(TweenManager.tween(o.mesh.scale, {
            x: 2,
            y: 2,
            z: 2
        }, 1000, "easeOutCubic", function() {
            Global.SHOT.L1DemoShot.interact()
        }))
    }

    function j() {
        g.object3D.position.z = Number.POSITIVE_INFINITY;
        o.mesh.position.z = Number.POSITIVE_INFINITY;
        p.mesh.position.z = Number.POSITIVE_INFINITY;
        b.mesh.position.z = Number.POSITIVE_INFINITY;
        Global.SCENE.video.setReveal(0);
        Tooltips.instance().cursor(false);
        s.mesh.position.z = Number.POSITIVE_INFINITY;
        q.delayedCall(function() {
            Global.SCENE_VIEW.hide()
        }, 2000)
    }

    function w() {
        p.uniforms.minOpacity.value = 0;
        p.uniforms.trailStart.value = 0;
        p.uniforms.trailEnd.value = 0;
        p.uniforms.maxOpacity.value = 0;
        p.uniforms.hardness.value = 1;
        Tooltips.instance().cursor(true);
        b.hide();
        Data.CAMERA.reset();
        g.object3D.position.z = 0;
        o.mesh.position.z = 0;
        g.object3D.position.y = 0;
        o.mesh.position.y = 0;
        p.mesh.position.y = 0;
        p.mesh.position.z = 0;
        s.mesh.position.y = 0;
        s.mesh.position.z = 0;
        d = true;
        TweenManager.clearTween(p.uniforms.maxOpacity);
        u.stopTween();
        h.stopTween();
        l();
        Global.SHOT.L1DemoShot.activate();
        Tooltips.instance().animateIn();
        Global.SCENE_VIEW.show();
        q.delayedCall(function() {
            Sound.play("1_a_new_orbit_rev", 0.3)
        }, 9000)
    }
    this.over = function() {
        q.stopTweens();
        TweenManager.clearTween(p.uniforms.maxOpacity);
        d = true;
        a = true;
        t.reset();
        Data.MOMENTS.remove(q);
        Data.SHOTS.remove(Global.SHOT.L1DemoShot);
        TweenManager.tween(b.mesh.scale, {
            x: 0.001,
            y: 0.001,
            z: 0.001
        }, 500, "easeInCubic");
        TweenManager.tween(s.mesh.scale, {
            x: 0.001,
            y: 0.001,
            z: 0.001
        }, 3000, "easeInCubic", function() {
            s.mesh.scale.set(1, 1, 1);
            s.hide();
            b.mesh.scale.set(1, 1, 1);
            b.hide()
        })
    };
    this.destroy = function() {
        Sound.cleanup("1_a_new_orbit_rev");
        t.reset();
        return this._destroy()
    }
});
Class(function CometHunter() {
    Inherit(this, TimeController);
    var h = this;
    var l, q, o, d;
    var m, p;
    var a = Global.INIT_MOMENT.strpos("comet-hunter") || Global.CHAPTER_SEEK;
    var n = 100;
    var b = Utils.toRadians(40);
    var c = h.initClass(DynamicObject, {
        v: 0.07
    });
    (function() {
        if (a) {
            Global.ELEMENTS.hideAll()
        }
        g();
        k();
        j();
        i();
        Render.startRender(f);
        Global.ELEMENTS.video.setOpacity(0);
        Data.SHOTS.initShot("CometHunterShot")
    })();

    function g() {
        l = Global.ELEMENTS.sun;
        q = Global.ELEMENTS.earth;
        o = Global.ELEMENTS.trajectorySmooth;
        d = Global.ELEMENTS.stars;
        m = Global.ELEMENTS.satellite;
        m.satellite.scale.set(1, 1, 1);
        Global.STATE_MODEL.replaceState("comet-chase");
        var r = [q.mesh, o, o.mesh, m.mesh, m.satellite, l.mesh, l.object3D];
        if (a) {
            r.push(Global.ELEMENTS.satelliteSmall);
            r.push(Global.ELEMENTS.satelliteSmall.satellite);
            Global.ELEMENTS.satelliteSmall.hide();
            Global.ELEMENTS.dot.hide()
        }
        ContactUtil.clearTweens(r);
        if (!Global.MOMENT.L1Demo) {
            l.show();
            l.object3D.position.set(2000, 0, 0);
            l.object3D.scale.set(2, 2, 2);
            q.show();
            q.mesh.scale.set(2, 2, 2);
            q.mesh.position.set(-2000, 0, 0);
            o.mesh.position.set(-2000, 0, 0);
            o.mesh.scale.set(0.8, 0.8, 0.8);
            o.show();
            o.uniforms.minOpacity.value = 0;
            o.uniforms.maxOpacity.value = 0.9;
            o.depthTest(true);
            o.depthWrite(false);
            d.mesh.position.x = 0;
            d.scale(20);
            d.setSize(200);
            o.uniforms.trailEnd.value = 0.05;
            o.uniforms.trailStart.value = 0.434264
        } else {
            Global.MOMENT.L1Demo.over();
            o.uniforms.trailEnd.value = 0.05;
            o.uniforms.trailStart.value = 0.434264
        } if (!a) {
            m.mesh.scale.set(0.001, 0.001, 0.001)
        } else {
            m.mesh.scale.set(3, 3, 3)
        } if (a) {
            q.hide()
        }
        m.show();
        Data.TRAJECTORY.orient("satellite_smooth", m.mesh, n, c.v, b, 1, o.mesh)
    }

    function k() {
        p = Global.ELEMENTS.title2;
        p.show();
        p.orient(0, 0, 1.5);
        p.opacity.value = 0;
        p.rotate(Utils.toRadians(0), Utils.toRadians(-90), 0);
        p.mesh.position.z = 1500
    }

    function j() {
        h.tween(c.tween({
            v: 0.1
        }, 30000, "linear"));
        if (a) {
            p.opacity.value = 1
        } else {
            h.tween(TweenManager.tween(q.mesh.scale, {
                x: 0.001,
                y: 0.001,
                z: 0.001
            }, 3000, "easeInCubic", function() {
                q.mesh.scale.set(1, 1, 1);
                q.spaceOut();
                q.hide()
            }));
            h.tween(TweenManager.tween(m.mesh.scale, {
                x: 3,
                y: 3,
                z: 3
            }, 5000, "easeOutCubic", 2000));
            h.tween(TweenManager.tween(p.opacity, {
                value: 1
            }, 2000, "easeOutSine", 3000))
        }
    }

    function f() {
        Data.TRAJECTORY.orient("satellite_smooth", m.mesh, n, c.v, 0, 0.02, o.mesh);
        p.mesh.rotation.x = 0;
        p.mesh.rotation.y = 0;
        p.mesh.rotation.z = 0
    }

    function i() {
        Data.CHAPTERS.listen(104.8, e)
    }

    function e() {
        Global.ELEMENTS.video.reset();
        Render.stopRender(f);
        Global.SCENE_VIEW.hide();
        Data.MOMENTS.remove(h);
        Data.SHOTS.remove(Global.SHOT.CometHunterShot);
        o.hide();
        l.hide();
        m.hide();
        q.hide();
        p.hide()
    }
    this.destroy = function() {
        m.mesh.scale.set(2, 2, 2);
        Render.stopRender(f);
        return this._destroy()
    }
});
Class(function CometTail(k, a) {
    Inherit(this, TimeController);
    var p = this;
    var q, h, o;
    var c, e, m;
    var f = Global.INIT_MOMENT == "comet-tail";
    var b = Sound.comet_seamless_loop;
    var g = 0;
    var i = new THREE.Vector3();
    var d = p.initClass(DynamicObject, {
        v: 0.28
    });
    (function() {
        if (!a) {
            Data.SHOTS.initShot("CometTailShot")
        }
        t();
        Render.startRender(s);
        if (!a) {
            p.delayedCall(n)
        } else {
            j()
        }
        l()
    })();

    function t() {
        Tooltips.instance().cursor(false);
        Global.SCENE_VIEW.show();
        if (!a) {
            Global.GL.flip = true
        }
        q = Global.ELEMENTS.stars;
        q.mesh.position.set(0, 0, 0);
        q.rotate();
        h = Global.ELEMENTS.comet;
        h.setSize(10);
        h.show();
        e = Global.ELEMENTS.sun;
        e.hide();
        e.reset();
        m = Global.ELEMENTS.earth;
        m.show();
        m.depthTest(false);
        m.reset();
        h.mesh.rotation.z = Utils.toRadians(40);
        h.mesh.rotation.y = Utils.toRadians(90);
        h.mesh.position.z = -200;
        h.mesh.position.y = 650;
        h.mesh.position.x = 2400;
        h.setSize(50);
        h.resetFade();
        h.origin = new THREE.Vector3();
        h.origin.copy(h.mesh.position);
        window.comet = h;
        o = Global.ELEMENTS.trajectoryAll;
        o.show();
        o.mesh.position.x = 0;
        o.mesh.position.y = 0;
        o.mesh.position.z = 0;
        o.uniforms.minOpacity.value = 0;
        o.uniforms.maxOpacity.value = 0.7;
        o.uniforms.trailStart.value = 0.287;
        o.uniforms.trailEnd.value = 0.99;
        o.uniforms.hardness.value = 1;
        c = Global.ELEMENTS.satellite;
        c.mesh.scale.set(2, 2, 2);
        c.edgeWidth(2);
        c.show();
        c.color(15615, 0.2);
        Data.TRAJECTORY.orient("satellite_all", c.mesh, 150, d.v, 0, 1, o.mesh)
    }

    function n() {
        if (Global.SHOT.CometTailShot) {
            Global.SHOT.CometTailShot.animateIn()
        }
        p.tween(TweenManager.tween(o.uniforms.trailStart, {
            value: 0.21
        }, 5000, "easeInOutCubic", 8000));
        p.tween(d.tween({
            v: 0.302
        }, 18000, "easeOutCubic", 5000, null, function() {
            d.complete = true
        }))
    }

    function j() {
        d.v = 0.287;
        h.mesh.position.set(150, 550, 900);
        h.origin.copy(h.mesh.position);
        d.complete = true
    }

    function s(v) {
        g += 0.007;
        h.mesh.position.z = h.origin.z + (Math.sin(g) * 100);
        h.mesh.position.y = h.origin.y + (Math.sin(g + 0.02) * 20);
        if (!d.complete) {
            o.uniforms.trailEnd.value = d.v - 0.0002
        }
        if (!a) {
            Data.TRAJECTORY.orient("satellite_all", c.mesh, 50, d.v, 0, 0.02, o.mesh)
        }
        i.copy(h.mesh.position).cross(Data.CAMERA.worldCamera.position).normalize();
        b.pos3d(i.x, i.y, i.z)
    }

    function l() {
        if (a) {
            return
        }
        Data.CHAPTERS.listen(237.91, u);
        Data.CHAPTERS.listen(250, r)
    }

    function u() {
        Tooltips.instance().cursor(true);
        Global.GL.flip = false;
        b.loop(true).play().volume(0);
        Sound.fade("comet_seamless_loop", 0, 0.3, 5000);
        p.delayedCall(function() {
            Sound.play("2_comet_hunter_rev", 0.15)
        }, 10000)
    }

    function r() {
        Global.SHOT.CometTailShot.activate()
    }
    this.end = function() {
        m.depthTest(true);
        Global.SHOT.CometTailShot.end();
        p.delayedCall(function() {
            Render.stopRender(s);
            Data.SHOTS.remove(p)
        }, 1000);
        Sound.fade("comet_seamless_loop", 0.2, 0, 5000, function() {
            b.pause()
        })
    };
    this.pause = function() {
        Render.stopRender(s);
        return this._pause()
    };
    this.resume = function() {
        Render.startRender(s);
        return this._resume()
    };
    this.destroy = function() {
        if (b.__playing) {
            Sound.fade("comet_seamless_loop", 0.2, 0, 5000, function() {
                b.pause()
            })
        }
        Sound.cleanup("comet_seamless_loop");
        Sound.cleanup("2_comet_hunter_rev");
        m.depthTest(true);
        Global.GL.flip = false;
        Render.stopRender(s);
        return this._destroy()
    }
});
Class(function FarquarManeuverMoment(m) {
    Inherit(this, TimeController);
    var q = this;
    var p, n, o, e, t, b, h, r;
    var w = 0.155;
    var d = 0.285;
    var u = 0.35;
    var g = 0.0001;
    var f = false;
    var j = {
        x: 2200,
        y: 2000,
        z: 0
    };
    var a = 2.5;
    var c = 28000;
    var i = {
        x: j.x - Math.cos(a) * c,
        y: j.y - Math.sin(a) * c,
        z: 0
    };
    var s = 1000;
    (function() {
        k();
        Data.SHOTS.initShot("FarquarManeuverShot");
        Data.CHAPTERS.listen(221.9002, l);
        Data.CHAPTERS.listen(162.8918, x);
        Data.TRAJECTORY.orient("satellite_all", b.mesh, 0, p.uniforms.trailEnd.value + 0.0001, Math.PI, 1)
    })();

    function x() {
        Global.SCENE_VIEW.show();
        Global.SCENE.video.setReveal(0.6);
        Global.SCENE.video.setRevealStrength(1.75);
        q.tween(TweenManager.tween(p.uniforms.trailEnd, {
            value: u * 0.9
        }, m.duration * s, "linear"));
        q.tween(TweenManager.tween(h.mesh.position, j, m.duration * s * 1.015, "linear", 0));
        Render.startRender(v);
        Data.TRAJECTORY.orient("satellite_all", b.mesh, 0, p.uniforms.trailEnd.value + 0.0001, 0, 1)
    }

    function k() {
        Global.SCENE_VIEW.hide();
        p = Global.ELEMENTS.trajectoryAll;
        p.reset();
        p.show();
        p.mesh.position.set(0, 0, 0);
        n = Global.ELEMENTS.earth;
        n.reset();
        n.show();
        e = Global.ELEMENTS.sun;
        e.reset();
        e.show();
        h = Global.ELEMENTS.comet;
        h.resetFade();
        h.mesh.position.copy(i);
        h.mesh.rotation.x = 0;
        h.mesh.rotation.y = 0;
        h.mesh.rotation.z = a;
        h.setSize(45);
        h.show();
        o = Global.ELEMENTS.moon;
        o.reset();
        o.show();
        r = Global.ELEMENTS.dot;
        r.reset();
        r.mesh.position.x = 1400;
        r.mesh.position.z = 100;
        r.show();
        o.speed = 0.02;
        o.angle = 0.8 + Utils.toRadians(30);
        t = Global.ELEMENTS.stars;
        t.reset();
        t.scale(50);
        t.rotate();
        t.speed = 0.00002;
        p.uniforms.trailStart.value = 0.1;
        p.uniforms.trailEnd.value = w;
        p.uniforms.minOpacity.value = 0;
        p.uniforms.maxOpacity.value = 0.7;
        p.uniforms.hardness.value = 1.5;
        p.depthWrite(false);
        p.disableLight();
        b = Global.ELEMENTS.satelliteSmall;
        b.reset();
        b.show();
        b.speed = 0.05;
        b.mesh.scale.set(1, 1, 1)
    }

    function l() {
        o.hide();
        r.hide();
        n.hide();
        p.hide();
        b.hide();
        e.hide();
        Global.SCENE.video.setReveal(0);
        Global.SCENE.video.material.power = 1;
        Render.stopRender(v);
        t.speed = 0.00001;
        Global.SCENE_VIEW.hide();
        Data.MOMENTS.remove(q);
        Data.SHOTS.remove(Global.SHOT.FarquarManeuverShot)
    }

    function v() {
        Data.TRAJECTORY.orient("satellite_all", b.mesh, 0, p.uniforms.trailEnd.value + 0.0001, 0, 0.05)
    }
    this.pause = function() {
        Render.stopRender(v);
        return this._pause()
    };
    this.resume = function() {
        Render.startRender(v);
        return this._resume()
    };
    this.destroy = function() {
        Render.stopRender(v);
        t.stopRotate();
        return this._destroy()
    }
});
Class(function FirstToReach() {
    Inherit(this, TimeController);
    var h = this;
    var f;
    var e = 0;
    (function() {
        b();
        c();
        Render.startRender(a);
        Data.SHOTS.initShot("FirstToReachShot")
    })();

    function b() {
        Global.SCENE_VIEW.hide();
        f = Global.ELEMENTS.comet;
        f.show();
        f.setSize(50);
        f.mesh.rotation.x = 0;
        f.mesh.rotation.y = 0;
        f.mesh.rotation.z = Utils.toRadians(15);
        f.mesh.position.set(-1000, -800, 0);
        f.origin = new THREE.Vector3();
        f.setBrightness(0.15);
        var i = [f.mesh];
        ContactUtil.clearTweens(i)
    }

    function c() {
        h.delayedCall(function() {
            Global.SCENE_VIEW.show()
        }, 100);
        h.tween(Global.ELEMENTS.video.fade(0.5, 1000, "easeInOutSine", 1000));
        f.origin.copy(f.mesh.position);
        h.tween(TweenManager.tween(f.origin, {
            x: 400,
            y: 150
        }, 3000, "easeOutQuart", 1000));
        h.tween(TweenManager.tween(f.mesh.position, {
            x: 400,
            y: 150
        }, 3000, "easeOutQuart", 1000));
        h.delayedCall(g, 20000)
    }

    function g() {
        h.tween(Global.ELEMENTS.video.fade(1, 1000, "easeInOutSine", 1000));
        h.tween(TweenManager.tween(f.origin, {
            x: 5300,
            y: 5800
        }, 3000, "easeInQuart"));
        h.tween(TweenManager.tween(f.mesh.position, {
            x: 5300,
            y: 5800
        }, 3000, "easeInQuart", function() {
            h.tween(f.fadeOut(1000));
            h.delayedCall(d, 1000)
        }))
    }

    function a(i) {
        e += 0.02;
        f.mesh.position.x = f.origin.x + (Math.sin(e) * 75);
        f.mesh.position.y = f.origin.y + (Math.sin(e) * 20)
    }

    function d() {
        f.hide();
        Render.stopRender(a);
        Global.SHOT.FirstToReachShot.end();
        Data.MOMENTS.remove(h)
    }
    this.pause = function() {
        Render.stopRender(a);
        return this._pause()
    };
    this.resume = function() {
        Render.startRender(a);
        return this._resume()
    };
    this.destroy = function() {
        f.resetFade();
        Global.ELEMENTS.video.fade(1, 1, "easeInOutSine");
        Render.stopRender(a);
        return this._destroy()
    }
});
Class(function ChangingTimes() {
    Inherit(this, TimeController);
    var g = this;
    var c, a, n, l;
    var o;
    var k = Global.INIT_MOMENT.strpos("changing-times") || Global.CHAPTER_SEEK;
    var b = g.initClass(DynamicObject, {
        v: 0.302,
        f: 0
    });
    (function() {
        if (k) {
            Data.CAMERA.resetPlanes()
        }
        if (k) {
            Global.ELEMENTS.hideAll()
        }
        if (Global.MOMENT.CometTail) {
            Global.MOMENT.CometTail.end()
        }
        Data.SHOTS.initShot("ChangingTimesShot");
        f();
        j();
        Render.startRender(d);
        h();
        Global.ELEMENTS.video.setOpacity(0);
        g.delayedCall(i, 1000)
    })();

    function f() {
        if (k) {
            Global.ELEMENTS.video.swap()
        }
        if (Global.PREVIEW || k) {
            g.initClass(CometTail, null, true)
        }
        Global.STATE_MODEL.replaceState("changing-times");
        n = Global.ELEMENTS.trajectoryAll;
        n.mesh.position.set(0, 0, 0);
        n.mesh.rotation.set(0, 0, 0);
        l = Global.ELEMENTS.satellite;
        l.edgeWidth(2);
        l.satellite.scale.set(2, 2, 2);
        l.mesh.scale.set(1, 1, 1);
        l.show();
        Data.TRAJECTORY.orient("satellite_all", l.mesh, 50, b.v, Utils.toRadians(0), 1);
        o = Global.ELEMENTS.title3;
        o.show();
        a = Global.ELEMENTS.comet;
        Global.SCENE_VIEW.show()
    }

    function j() {
        o.orient(-220, 0, 0.26);
        o.opacity.value = 0;
        o.inner.rotation.x = Utils.toRadians(-90);
        o.inner.material.depthTest = true;
        Data.TRAJECTORY.orient("satellite_all", o.mesh, 0, 0.305, 0, 1)
    }

    function i() {
        if (k) {
            n.uniforms.hardness.value = 1.3
        } else {
            g.tween(TweenManager.tween(n.uniforms.harndess, {
                value: 1.3
            }, 2000, "easeInOutSine", 3000))
        }
        Global.SHOT.ChangingTimesShot.animateIn();
        g.tween(b.tween({
            v: 0.35
        }, 140000, "linear"));
        Global.ELEMENTS.video.setOpacity(0);
        g.tween(a.fadeOut(2000, 2000));
        g.tween(TweenManager.tween(b, {
            f: 0.0015
        }, 2000, "easeOutCubic", 2000));
        g.tween(TweenManager.tween(o.opacity, {
            value: 0.9
        }, 4000, "easeOutSine", 3500, function() {
            a.hide();
            g.tween(TweenManager.tween(o.opacity, {
                value: 0
            }, 2000, "easeOutSine", 2000));
            g.delayedCall(Global.SHOT.ChangingTimesShot.cutToFar, 4250)
        }))
    }

    function d(p) {
        n.uniforms.trailEnd.value = b.v + (!k ? b.f : 0);
        Data.TRAJECTORY.orient("satellite_all", l.mesh, 50, b.v, Utils.toRadians(0), 0.02)
    }

    function h() {
        Data.CHAPTERS.listen(272, m);
        Data.CHAPTERS.listen(285.5481, e)
    }

    function m() {
        Global.ELEMENTS.video.setOpacity(0);
        Global.ELEMENTS.video.fade(0.8, 1000, "easeInOutSine")
    }

    function e() {
        Global.ELEMENTS.video.setOpacity(1);
        Render.stopRender(d);
        o.hide();
        a.hide();
        l.hide();
        n.hide();
        Data.SHOTS.remove(Global.SHOT.ChangingTimesShot);
        Data.MOMENTS.remove(g)
    }
    this.destroy = function() {
        Global.ELEMENTS.video.setOpacity(1);
        a.resetFade();
        Render.stopRender(d);
        return this._destroy()
    }
});
Class(function PhoneCordOrbitMoment(n, b) {
    Inherit(this, TimeController);
    var t = this;
    var s, q, e, w, o, g, u;
    var v = Global.PREVIEW ? 1 : 0.1;
    var l = 0.305,
        h = 0.98;
    var x;
    var z, m;
    var A;
    var a = 1;
    this.SPEED_UP = a;
    (function() {
        k();
        if (!Global.PREVIEW) {
            c()
        } else {
            s.uniforms.trailEnd.value = h;
            y()
        }
        r();
        if (Global.PREVIEW) {
            i()
        }
        Global.ELEMENTS.video.setOpacity(0.55);
        Render.startRender(y)
    })();

    function k() {
        Data.SHOTS.initShot("PhoneCordOrbitShot");
        s = Global.ELEMENTS.trajectoryAll;
        s.reset();
        s.show();
        s.disableLight();
        q = Global.ELEMENTS.earth;
        q.reset();
        q.show();
        q.mesh.scale.set(2, 2, 2);
        e = Global.ELEMENTS.sun;
        e.reset();
        e.show();
        w = Global.ELEMENTS.stars;
        w.scale(30, 50000);
        o = Global.ELEMENTS.satelliteSmall;
        o.show();
        o.reset();
        o.mesh.scale.set(4, 4, 4);
        o.speed = 0.075;
        o.opacity = 1;
        g = Global.ELEMENTS.satellite;
        g.show();
        g.reset();
        g.mesh.scale.set(0.2, 0.2, 0.2);
        g.opacity = 0;
        g.speed = 0.075;
        s.uniforms.trailStart.value = l;
        s.uniforms.trailEnd.value = l;
        s.uniforms.minOpacity.value = 0;
        s.uniforms.maxOpacity.value = 1;
        s.uniforms.hardness.value = 1;
        s.material.transparent = true;
        s.material.wireframe = true;
        s.depthWrite(true);
        s.depthTest(true);
        Data.MOMENTS.listen(t, 0.78 * a, f);
        Data.MOMENTS.listen(t, 0.9 * a, j);
        Data.TRAJECTORY.orient("satellite_all", o.mesh, 0, 0.001, Math.PI, 1);
        Data.TRAJECTORY.orient("satellite_all", g.mesh, 0, 0.001, Math.PI, 1)
    }

    function r() {
        A = [{
            geom: new THREE.RingGeometry(6600, 8500, 20, 1),
            name: "orbit",
            x: Global.ELEMENTS.sun.object3D.position.x - 200,
            y: 0,
            z: 0
        }, {
            x: 10500,
            y: 0,
            z: 0,
            w: 2500,
            h: 2500,
            d: 2500,
            name: "satellite"
        }, ]
    }

    function j() {
        o.fadeIn(500, 3000);
        Global.SHOT.PhoneCordOrbitShot.zoomOut();
        r();
        t.delayedCall(function() {
            s.material.wireframe = true
        }, 500);
        t.delayedCall(function() {
            g.hide()
        }, 3500);
        t.delayedCall(function() {
            Sound.play("3_changing_times_rev", 0.15)
        }, 5000);
        t.delayedCall(i, 2000)
    }

    function i() {
        u = t.initClass(InteractiveElements, A, false);
        u.events.add(HydraEvents.CLICK, p);
        u.addListeners();
        u.detectHit = function(B) {
            if (B.length > 1) {
                for (var C = 0; C < B.length; C++) {
                    if (B[C].object.name == "satellite") {
                        return B[C].object
                    }
                }
            } else {
                return B[0].object
            }
        };
        Tooltips.instance().animateIn();
        Global.INTERACTIVE_MOMENT = true
    }

    function p(B) {
        Tooltips.instance().hoverIn(3, B.name)
    }

    function f() {
        Global.SHOT.PhoneCordOrbitShot.zoomIn1();
        o.fadeOut(500);
        g.fadeIn(500);
        g.mesh.scale.set(4, 4, 4);
        s.material.wireframe = false;
        s.uniforms.hardness.value = 15;
        s.uniforms.hardness.value = 300
    }

    function d() {
        Global.SHOT.PhoneCordOrbitShot.zoomIn2();
        s.material.wireframe = false;
        s.material.wireframeLinewidth = 5;
        s.uniforms.hardness.value = 150
    }

    function c() {
        t.tween(TweenManager.tween(s.uniforms.trailEnd, {
            value: h
        }, n.duration * 1000 * a, "linear"))
    }

    function y() {
        Data.TRAJECTORY.orient("satellite_all", o.mesh, 0, s.uniforms.trailEnd.value + 0.0015, Math.PI, v);
        Data.TRAJECTORY.orient("satellite_all", g.mesh, 0, s.uniforms.trailEnd.value + 0.0015, Math.PI, v)
    }
    this.destroy = function() {
        Sound.cleanup("3_changing_times_rev");
        g.speed = 0.005;
        w.reset();
        s.material.wireframe = false;
        Render.stopRender(y);
        Global.INTERACTIVE_MOMENT = false;
        return this._destroy()
    };
    this.over = function() {
        g.speed = 0.005;
        clearTimeout(x);
        s.hide();
        q.hide();
        o.hide();
        g.hide();
        o.opacity = 1;
        g.opacity = 1;
        Render.stopRender(y);
        s.material.wireframe = false;
        Data.MOMENTS.remove(t);
        Data.SHOTS.remove(Global.SHOT.PhoneCordOrbitShot)
    }
});
Class(function AttemptAtContact() {
    Inherit(this, TimeController);
    var l = this;
    var o, j, k, a;
    var c, m;
    var d = l.initClass(DynamicObject, {
        v: 0.989
    });
    var f;
    (function() {
        Global.SCENE_VIEW.show();
        Global.GL.flip = true;
        p();
        Data.SHOTS.initShot("AttemptAtContactShot");
        e();
        i();
        b();
        Render.startRender(q);
        if (Global.PREVIEW) {
            r()
        }
    })();

    function p() {
        o = Global.ELEMENTS.stars;
        o.mesh.position.x = 0;
        k = Global.ELEMENTS.trajectoryAll;
        k.show();
        k.uniforms.minOpacity.value = 0;
        k.uniforms.maxOpacity.value = 0.9;
        k.uniforms.trailStart.value = 0.986;
        k.mesh.position.set(0, 0, 0);
        k.mesh.rotation.x = 0;
        k.mesh.rotation.y = 0;
        k.mesh.rotation.z = 0;
        k.uniforms.hardness.value = 1;
        j = Global.ELEMENTS.earth;
        j.show();
        j.mesh.position.set(1220, 0, -1650);
        j.mesh.scale.set(8, 8, 8);
        j.mesh.rotation.x = -0.38;
        j.mesh.rotation.y = 0;
        j.mesh.rotation.z = 2.6179938779914944;
        j.orbitSpeed(0);
        j.hideGlow();
        j.mesh.rotation.set(-0.20943951023931956, 0, -1.4835298641951802);
        j.mesh.children[0].rotation.set(1.4, 4.01999, 0);
        a = Global.ELEMENTS.satellite;
        a.show();
        a.edgeWidth(2);
        a.mesh.scale.set(2, 2, 2);
        var s = new THREE.PlaneGeometry(1024, 128, 1, 1);
        var v = new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture(Config.IMAGES + "labels/arecibo-type.png"),
            transparent: true,
            depthWrite: false,
            depthTest: false
        });
        f = new THREE.Object3D();
        var u = new THREE.Mesh(s, v);
        u.position.x += 1024 / 2;
        f.add(u);
        f.position.copy({
            x: 970,
            y: -650,
            z: -1240
        });
        Global.ELEMENTS.scene.add(f);
        Data.TRAJECTORY.orient("satellite_all", a.mesh, 0, d.v, Utils.toRadians(180), 1);
        var t = [j.mesh, k, k.mesh, a.mesh, a.satellite, ];
        Global.ELEMENTS.dot.hide();
        Global.ELEMENTS.satelliteSmall.hide();
        Global.ELEMENTS.title1.hide();
        Global.ELEMENTS.title2.hide();
        Global.ELEMENTS.title3.hide();
        Global.ELEMENTS.title4.hide();
        Global.ELEMENTS.title5.hide();
        ContactUtil.clearTweens(t)
    }

    function e() {
        l.tween(d.tween({
            v: 0.9955
        }, 50000, "easeeOutCubic"))
    }

    function q() {
        f.quaternion.copy(Data.CAMERA.worldCamera.quaternion);
        k.uniforms.trailEnd.value = d.v + 0.0002;
        Data.TRAJECTORY.orient("satellite_all", a.mesh, 0, d.v, Utils.toRadians(180), 0.2);
        c.update();
        m.update()
    }

    function b() {
        c = l.initClass(AttemptAtContactRings, 0.85, true, j.mesh);
        Global.ELEMENTS.scene.add(c.object3D);
        c.object3D.scale.set(2.3, 2.3, 2.3);
        c.radius = 6.9;
        m = l.initClass(AttemptAtContactRings, 0.46, false, a.mesh);
        m.object3D.scale.set(1.6, 1.6, 1.6);
        m.object3D.endRadius = 7.2;
        m.object3D.radius = 7;
        Global.ELEMENTS.scene.add(m.object3D)
    }

    function i() {
        Data.MOMENTS.listen(l, 1.1, h);
        Data.MOMENTS.listen(l, 1.3117, n);
        Data.CHAPTERS.listen(438.195, r)
    }

    function h() {
        Sound.play("4_contact_rev", 0.25)
    }

    function n() {
        Global.SHOT.AttemptAtContactShot.transition()
    }

    function g() {
        c.animateOut();
        m.animateOut(function() {
            Global.ELEMENTS.scene.remove(f);
            Global.ELEMENTS.scene.remove(c.object3D);
            Global.ELEMENTS.scene.remove(m.object3D)
        })
    }

    function r() {
        Data.CAMERA.reset();
        l.tween(Global.ELEMENTS.video.fade(0.5, 2000, "easeInSine"));
        Global.GL.flip = false;
        l.delayedCall(c.animate, 400);
        l.delayedCall(m.animate, 35000)
    }
    this.end = function() {
        Data.SHOTS.remove(Global.SHOT.AttemptAtContactShot);
        Data.MOMENTS.remove(l)
    };
    this.changeRadius = function() {
        c.radius = 6.2
    };
    this.destroy = function() {
        Sound.cleanup("4_contact_rev");
        Global.GL.flip = false;
        j.showGlow();
        j.orbitSpeed(0.001);
        Render.stopRender(q);
        g();
        return this._destroy()
    }
});
Class(function AttemptAtContactRings(h, c, a) {
    Inherit(this, Component);
    var e = this;
    var k = [];
    var d = 15000;
    var f = 1500;
    var j = new THREE.Quaternion();
    this.alpha = 0.35;
    this.radius = 6.5;
    this.endRadius = 9;
    this.object3D = new THREE.Object3D();
    (function() {
        g()
    })();

    function g() {
        var l = THREE.ImageUtils.loadTexture(Config.IMAGES + "elements/ring.png");
        var o = new THREE.PlaneGeometry(200, 200);
        for (var n = 0; n < 5; n++) {
            var m = new THREE.MeshBasicMaterial({
                color: 16777215,
                map: l
            });
            m.transparent = true;
            m.depthWrite = false;
            m.depthTest = false;
            m.opacity = 0;
            m.color.setHSL(h, 0.8, 0.6);
            var p = new THREE.Mesh(o, m);
            e.object3D.add(p);
            k.push(p)
        }
    }

    function b() {
        for (var l = 0; l < k.length; l++) {
            i(k[l], l * f)
        }
    }

    function i(m, l) {
        l = l || 0;
        TweenManager.tween(m.scale, {
            x: 10,
            y: 10,
            z: 10
        }, d, "easeOutCubic", l, function() {
            m.scale.set(1, 1, 1);
            m.material.opacity = 0;
            m.material.color.setHSL(h, 0.5, 0.4);
            m.material.colorSet = false;
            i(m)
        })
    }
    this.update = function() {
        e.object3D.quaternion.copy(Data.CAMERA.worldCamera.quaternion);
        if (a) {
            e.object3D.position.copy(a.position)
        }
        for (var l = 0; l < k.length; l++) {
            var n = k[l];
            var m = n.scale.x;
            var o = e.alpha;
            if (m < this.radius) {
                n.material.opacity = Utils.convertRange(m, 1, this.radius, 0, o)
            } else {
                o = 1;
                if (!n.material.colorSet) {
                    TweenManager.tween(n.material.hue);
                    n.material.colorSet = true;
                    n.material.color.setHSL(h, 0.8, 0.6)
                }
                n.material.opacity = Math.max(Utils.convertRange(m, this.radius, this.radius * 1.2, 1, 0), 0)
            }
        }
    };
    this.animate = function() {
        b()
    };
    this.loop = function() {
        e.radius = 5;
        e.alpha = 0.7;
        c = true;
        b()
    };
    this.animateOut = function(n) {
        for (var l = 0; l < k.length; l++) {
            k[l].material.sopacity = k[l].material.opacity
        }
        var m = new DynamicObject({
            v: 1
        });
        m.tween({
            v: 0
        }, 2000, "easeOutSine", function() {
            for (var o = 0; o < k.length; o++) {
                k[o].material.opacity = k[o].material.sopacity * m.v
            }
        }, n)
    }
});
Class(function Contact() {
    Inherit(this, TimeController);
    var h = this;
    var c, m, o, l;
    var n;
    var a = Global.INIT_MOMENT.strpos("contact") || Global.CHAPTER_SEEK;
    var b = h.initClass(DynamicObject, {
        v: 0.993
    });
    (function() {
        if (a) {
            Global.ELEMENTS.hideAll()
        }
        f();
        k();
        j();
        Render.startRender(e);
        i();
        Global.ELEMENTS.video.setOpacity(0);
        Data.SHOTS.initShot("ContactShot")
    })();

    function f() {
        if (Global.MOMENT.PhoneCordOrbitMoment) {
            Global.MOMENT.PhoneCordOrbitMoment.over()
        }
        Global.ELEMENTS.sun.hide();
        Global.STATE_MODEL.replaceState("contact");
        c = Global.ELEMENTS.stars;
        c.mesh.position.x = 0;
        c.scale(5);
        m = Global.ELEMENTS.trajectoryAll;
        m.show();
        m.uniforms.minOpacity.value = 0;
        m.uniforms.maxOpacity.value = 0.9;
        m.uniforms.trailStart.value = 0.986;
        m.uniforms.trailEnd.value = 0.999;
        m.uniforms.hardness.value = 1;
        o = Global.ELEMENTS.earth;
        o.mesh.position.set(-300, -440, 0);
        o.mesh.scale.set(2, 2, 2);
        o.show();
        o.hideGlow();
        l = Global.ELEMENTS.satellite;
        l.show();
        l.mesh.scale.set(2, 2, 2);
        l.satellite.scale.set(1, 1, 1);
        l.edgeWidth(2);
        l.mesh.rotation.z = Utils.toRadians(-15);
        Global.ELEMENTS.video.setOpacity(0);
        m.mesh.position.set(0, 800, 0);
        m.mesh.rotation.z = Utils.toRadians(-5);
        Data.TRAJECTORY.orient("satellite_all", l.mesh, 0, b.v, Utils.toRadians(0), 1, m.mesh)
    }

    function k() {
        n = Global.ELEMENTS.title4;
        n.inner.rotation.z = Utils.toRadians(42);
        n.show();
        n.opacity.value = 0;
        n.orient(-1200, 0, 1.4);
        Data.TRAJECTORY.orient("satellite_all", n.mesh, 0, 0.989, Utils.toRadians(180), 1, m.mesh)
    }

    function j() {
        h.delayedCall(Data.CAMERA.reset, 100);
        h.tween(b.tween({
            v: 0.999
        }, 16500, "easeOutCirc"));
        h.tween(TweenManager.tween(n.opacity, {
            value: 0.9
        }, 2000, "easeOutSine", 1500, function() {
            h.tween(TweenManager.tween(n.opacity, {
                value: 0
            }, 1000, "easeOutSine", 3000))
        }))
    }

    function e() {
        m.uniforms.trailEnd.value = b.v - 0.0006;
        Data.TRAJECTORY.orient("satellite_all", l.mesh, 0, b.v, Utils.toRadians(0), 0.02, m.mesh);
        n.mesh.quaternion.copy(Data.CAMERA.perspective.quaternion)
    }

    function i() {
        Data.CHAPTERS.listen(378.0863, g);
        Data.CHAPTERS.listen(381.57, d)
    }

    function g() {
        Global.ELEMENTS.video.setOpacity(0);
        Global.ELEMENTS.video.fade(0.7, 1000, "easeOutSine")
    }

    function d() {
        Global.ELEMENTS.video.setOpacity(1);
        Global.SCENE_VIEW.hide();
        Render.stopRender(e);
        Data.SHOTS.remove(Global.SHOT.ContactShot);
        Data.MOMENTS.remove(h)
    }
    this.destroy = function() {
        Global.ELEMENTS.video.setOpacity(1);
        l.mesh.rotation.z = 0;
        o.showGlow();
        Render.stopRender(e);
        return this._destroy()
    }
});
Class(function TodayMoment() {
    Inherit(this, TimeController);
    var j = this;
    var e, n, p, m;
    var o;
    var a = Global.INIT_MOMENT.strpos("today") || Global.CHAPTER_SEEK;
    var d = j.initClass(DynamicObject, {
        v: 0.9999
    });
    (function() {
        if (a) {
            Global.ELEMENTS.hideAll()
        }
        if (Global.MOMENT.AttemptAtContact) {
            Global.MOMENT.AttemptAtContact.end()
        }
        h();
        l();
        b();
        Render.startRender(f);
        if (Global.PREVIEW) {
            Global.ELEMENTS.video.swap();
            j.initClass(AttemptAtContact, null, true)
        }
        Data.SHOTS.initShot("TodayShot");
        k();
        Global.ELEMENTS.video.setOpacity(0);
        j.delayedCall(function() {
            Global.ELEMENTS.video.setOpacity(0)
        }, 1000)
    })();

    function h() {
        e = Global.ELEMENTS.stars;
        e.mesh.position.x = 0;
        Global.STATE_MODEL.replaceState("a-new-era");
        n = Global.ELEMENTS.trajectoryAll;
        n.show();
        n.uniforms.minOpacity.value = 0;
        n.uniforms.maxOpacity.value = 0.9;
        n.uniforms.trailStart.value = 0.986;
        n.mesh.position.set(0, 0, 0);
        n.mesh.rotation.x = 0;
        n.mesh.rotation.y = 0;
        n.mesh.rotation.z = 0;
        n.mesh.material.depthTest = false;
        n.uniforms.hardness.value = 1;
        p = Global.ELEMENTS.earth;
        p.show();
        p.mesh.position.set(1220, 0, -1650);
        p.mesh.scale.set(8, 8, 8);
        p.hideGlow();
        m = Global.ELEMENTS.satellite;
        m.show();
        m.mesh.scale.set(2, 2, 2);
        m.satellite.scale.set(1, 1, 1);
        m.edgeWidth(2);
        m.color(6662069, 0.2);
        var q = [p.mesh, n, n.mesh, m.mesh, m.satellite, ];
        ContactUtil.clearTweens(q);
        Data.TRAJECTORY.orient("satellite_all", m.mesh, 0, 0.9955, Utils.toRadians(180), 1);
        n.uniforms.trailEnd.value = 0.9955 + 0.0002
    }

    function l() {
        o = Global.ELEMENTS.title5;
        o.show();
        o.opacity.value = 0;
        o.orient(700, -100, 1);
        Data.TRAJECTORY.orient("satellite_all", o.mesh, 0, 0.999, Utils.toRadians(180), 1)
    }

    function b() {
        j.tween(d.tween({
            v: 0.994
        }, 10000, "linear", 4000));
        j.tween(TweenManager.tween(o.opacity, {
            value: 0.9
        }, 4000, "easeOutSine", 4500, function() {
            j.tween(TweenManager.tween(o.opacity, {
                value: 0
            }, 2000, "easeOutSine", a ? 0 : 2000))
        }))
    }

    function f() {
        Data.TRAJECTORY.orient("satellite_all", o.mesh, 0, d.v, Utils.toRadians(180), 0.02)
    }

    function k() {
        Data.CHAPTERS.listen(526.4271, c);
        Data.CHAPTERS.listen(502.6496, i)
    }

    function c() {
        Overlay.instance().fade(1, 2000, "easeOutSine", function() {
            g();
            Overlay.instance().setFade(0)
        })
    }

    function i() {
        Global.ELEMENTS.video.setOpacity(0);
        j.tween(Global.ELEMENTS.video.fade(0.5, 500, "easeOutSine"))
    }

    function g() {
        Global.ELEMENTS.video.setOpacity(1);
        Global.SCENE_VIEW.hide();
        n.hide();
        p.hide();
        m.hide();
        Render.stopRender(f);
        Data.MOMENTS.remove(j);
        Data.SHOTS.remove(Global.SHOT.TodayShot)
    }
    this.destroy = function() {
        p.specular(500, 0, 0);
        Global.ELEMENTS.video.setOpacity(1);
        n.mesh.material.depthTest = true;
        Global.SCENE_VIEW.show();
        return this._destroy()
    }
});
Class(function LiveMoment() {
    Inherit(this, Component);
    var z = this;
    var x, v, t, k, y, D, C, a, B, o, n;
    var g = [];
    var s, G;
    var b, j;
    var A;
    var h = new THREE.Vector3(Config.CONSTANTS.EARTH_SUN_DISTANCE, 0, 0);
    h.multiplyScalar(Config.CONSTANTS.LIVE_SCALE);
    var p = window.location.search.substring(1);
    p = p.replace(/%20/g, " ");
    p = new Date(p);
    p = p.getTime();
    var d = new Date("06 Aug 2014 00:00:00 GMT");
    var f = new Date("17 Aug 2014 00:00:00 GMT");
    var F = 1.01431872790797;
    var e = 1.01249698747141;
    var c = 10;
    (function() {
        if (Global.PREVIEW) {
            Global.ELEMENTS.loadLive()
        }
        Global.ELEMENTS.video.hide();
        Global.ELEMENTS.hideAll();
        Global.SCENE_VIEW.show();
        Data.SHOTS.initShot("LiveShot", true);
        Global.LIVE_STATS = {};
        Live.instance().animateIn();
        i();
        r();
        Render.startRender(H);
        Global.STATE_MODEL.replaceState("live");
        if (!Config.HANGOUT) {
            Sound["4_contact_rev"].loop(true).play();
            Sound.fade("4_contact_rev", 0, 0.2, 3000);
            Tooltips.instance().reset();
            z.delayedCall(E, 1000)
        }
        z.delayedCall(function() {
            Global.ELEMENTS.video.hide()
        }, 750)
    })();

    function u(I) {
        Tooltips.instance().hoverIn(5, I.name)
    }

    function i() {
        s = Config.PATH_GEOMETRY.moon.startDate;
        G = Config.PATH_GEOMETRY.moon.endDate;
        b = Config.PATH_GEOMETRY.satellite_future.startDate;
        j = Config.PATH_GEOMETRY.satellite_future.endDate
    }

    function E() {
        var I = [{
            geom: Global.ELEMENTS.trajectoryFuture.mesh.geometry,
            name: "trajectory",
            x: 0,
            y: -c,
            z: 0
        }, {
            x: t.mesh.position.x,
            y: t.mesh.position.y,
            z: t.mesh.position.z,
            w: 50,
            h: 50,
            d: 50,
            name: "mission"
        }, ];
        if (!Config.HANGOUT) {
            I.push({
                x: x.mesh.position.x,
                y: x.mesh.position.y,
                z: x.mesh.position.z,
                w: 30,
                h: 30,
                d: 30,
                name: "moon"
            });
            I.push({
                x: o.position.x + 50,
                y: o.position.y + 50,
                z: o.position.z,
                w: 120,
                h: 50,
                d: 100,
                name: "august",
                rz: 45
            });
            I.push({
                x: n.position.x + 50,
                y: n.position.y + 50,
                z: n.position.z,
                w: 120,
                h: 50,
                d: 100,
                name: "july",
                rz: 45
            });
            A = z.initClass(InteractiveElements, I, false);
            A.events.add(HydraEvents.CLICK, u);
            A.addListeners()
        }
        if (Global.PREVIEW && !Device.mobile) {
            Tooltips.instance().animateIn()
        }
    }

    function r() {
        Global.LIVE_VIEW = true;
        x = Global.ELEMENTS.moon;
        x.show();
        x.speed = 0;
        x.mesh.position.set(0, 0, 0);
        x.mesh.children[0].rotation.set(0.6, 0.1, 0);
        x.depthTest = false;
        x.realShading(true);
        var I = 6 / x.geometryRadius * Config.CONSTANTS.MOON_RADIUS * Config.CONSTANTS.LIVE_SCALE;
        x.mesh.scale.set(I, I, I);
        v = Global.ELEMENTS.earth;
        v.show();
        v.speed = 0;
        v.mesh.position.set(0, 0, 0);
        v.specular(-500, 0, 0);
        var I = 6 / v.geometryRadius * Config.CONSTANTS.EARTH_RADIUS * Config.CONSTANTS.LIVE_SCALE;
        v.mesh.scale.set(I, I, I);
        t = Global.ELEMENTS.satelliteSmall;
        t.show();
        t.opacity = 1;
        t.mesh.scale.set(0.25, 0.25, 0.25);
        k = Global.ELEMENTS.satellite;
        k.hide();
        k.opacity = 0;
        k.mesh.scale.set(0.01, 0.01, 0.01);
        k.satellite.scale.set(1, 1, 1);
        k.color(6140590, 0.3);
        y = Global.ELEMENTS.trajectoryFuture;
        y.reset();
        y.mesh.position.y -= c;
        y.material.blending = THREE.AdditiveBlending;
        y.uniforms.hardness.value = 0.5;
        y.uniforms.minOpacity.value = 0.65;
        y.uniforms.maxOpacity.value = 0.65;
        y.depthWrite(false);
        y.depthTest(true);
        y.show();
        D = Global.ELEMENTS.trajectoryMoon;
        D.reset();
        D.material.blending = THREE.AdditiveBlending;
        D.material.wireframe = true;
        D.material.wireframeLinewidth = 2;
        D.uniforms.hardness.value = 1;
        D.uniforms.minOpacity.value = 0;
        D.uniforms.maxOpacity.value = 0.1;
        D.uniforms.bumpSaturation.value = 0;
        D.depthWrite(false);
        D.depthTest(true);
        D.show();
        a = new THREE.Line(new THREE.RingGeometry(1, 1, 80), new THREE.LineBasicMaterial({
            color: 16777215,
            transparent: true,
            opacity: 0.05,
            wireframe: true,
            wireframeLinewidth: 2,
            depthTest: false,
            depthWrite: false
        }));
        B = Global.ELEMENTS.dot;
        B.mesh.scale.set(0.3, 0.3, 0.3);
        B.mesh.position.x = Config.CONSTANTS.L1_DISTANCE * Config.CONSTANTS.LIVE_SCALE;
        if (!Config.HANGOUT) {
            o = w("aug10.png", "Sun, Aug 10, 2014 18:15:00 GMT", 50)
        }
        n = w("jul31.png", "Jul 31, 2014 00:00:00 GMT", 50);
        var J = w("aug20.png", "Aug 20, 2014 00:00:00 GMT", 50)
    }

    function m(I) {
        var J = new THREE.Object3D();
        var L = new THREE.SpriteMaterial({
            map: THREE.ImageUtils.loadTexture(Config.IMAGES + "labels/" + I),
            transparent: true,
            color: 16777215,
            useScreenCoordinates: false,
            scaleByViewport: true,
            sizeAttenuation: false,
            rotation: Math.PI / 4,
            blending: THREE.AdditiveBlending
        });
        var K = new THREE.Sprite(L);
        K.scale.set(1024 / 3, 128 / 3);
        L.map.offset.set(-1, -0.5);
        L.map.repeat.set(2, 2);
        J.add(K);
        Global.ELEMENTS.scene.add(J);
        g.push(J);
        return J
    }

    function w(J, L, P) {
        var O = m(J);
        var N = new THREE.IcosahedronGeometry(1, 1);
        var I = new THREE.MeshBasicMaterial({
            color: 16777215
        });
        var K = new THREE.Mesh(N, I);
        var M = Utils.convertRange(new Date(L).getTime(), b, j, 0, 1);
        l("satellite_future", O, M, P);
        return O
    }

    function l(J, L, I, K) {
        I = Math.max(0, Math.min(I, 0.999));
        Data.TRAJECTORY.orient2(J, L, K || 0, I, 0, 1);
        Data.TRAJECTORY.getPath(J).spline.copyPoint(I, L.position)
    }

    function q(K, J, I) {
        return (K - J) / (I - J)
    }

    function H() {
        var K = p === p ? p : Date.now();
        Global.LIVE_STATS.time = K;
        var I = q(K, s, G);
        var L = q(K, b, j);
        l("moon", x.mesh, I);
        l("satellite_future", t.mesh, L);
        l("satellite_future", k.mesh, L);
        var J = x.mesh.position.length();
        a.scale.set(J, J, J);
        D.uniforms.trailEnd.value = Math.min(1, I + 0.1);
        D.uniforms.trailStart.value = Math.max(0, D.uniforms.trailEnd.value - 0.6);
        Global.LIVE_STATS.earth = t.mesh.position.distanceTo(v.mesh.position) / Config.CONSTANTS.LIVE_SCALE - Config.CONSTANTS.EARTH_RADIUS;
        Global.LIVE_STATS.moon = t.mesh.position.distanceTo(x.mesh.position) / Config.CONSTANTS.LIVE_SCALE - Config.CONSTANTS.MOON_RADIUS;
        Global.LIVE_STATS.sun = Utils.convertRange(K, d, f, F, e);
        Global.LIVE_STATS.earth = Global.LIVE_STATS.earth.toFixed(2);
        Global.LIVE_STATS.moon = Global.LIVE_STATS.moon.toFixed(2);
        Global.LIVE_STATS.sun = Global.LIVE_STATS.sun.toFixed(8)
    }
    this.hangout = function(I) {
        if (I) {
            t.mesh.scale.set(0.6, 0.6, 0.6);
            k.edgeWidth(1)
        } else {
            t.mesh.scale.set(0.25, 0.25, 0.25);
            k.edgeWidth(2)
        }
    };
    this.destroy = function() {
        v.specular(500, 0, 0);
        if (!Config.HANGOUT) {
            Sound.fade("4_contact_rev", 0.2, 0, 3000, function() {
                Sound["4_contact_rev"].stop()
            });
            Sound.cleanup("4_contact_rev")
        }
        Data.CAMERA.resetPlanes();
        Live.instance().animateOut();
        Tooltips.instance().hoverOut();
        B.hide();
        v.hide();
        y.hide();
        D.hide();
        t.hide();
        k.hide();
        for (var I = 0; I < g.length; I++) {
            Global.ELEMENTS.scene.remove(g[I])
        }
        Render.stopRender(H);
        return this._destroy()
    };
    this.satelliteSmall = function() {
        if (A) {
            A.addListeners()
        }
        z.delayedCall(function() {
            k.hide()
        }, 1000);
        t.fadeIn(500, 1000);
        TweenManager.tween(D.uniforms.maxOpacity, {
            value: 0.1
        }, 3000, "easeOutSine")
    };
    this.satelliteBig = function() {
        if (A) {
            A.removeListeners()
        }
        k.show();
        t.fadeOut(500);
        TweenManager.tween(D.uniforms.maxOpacity, {
            value: 0
        }, 3000, "easeOutSine")
    }
});
Class(function OverviewMoment(b) {
    Inherit(this, TimeController);
    var j = this;
    var g, k, n, q, a, l, p = [];
    var m;
    var c = window.location.href.strpos("preview");
    (function() {
        if (Global.SHOT.ANewOrbitShot) {
            Data.SHOTS.remove(Global.SHOT.ANewOrbitShot)
        }
        if (Global.MOMENT.ANewOrbit) {
            Data.MOMENTS.remove(Global.MOMENT.ANewOrbit)
        }
        if (Global.SCENE_VIEW) {
            Global.SCENE_VIEW.show()
        }
        Global.CHAPTER_OVERVIEW = true;
        i();
        Data.SHOTS.initShot("OverviewShot");
        if (!ContactDevice.PREVENT_3D) {
            j.events.subscribe(ContactEvents.BEGIN, o)
        }
        if (Global.CHAPTER_SEEK && !Global.HOME_PAGE) {
            j.delayedCall(o, 2000)
        }
        j.delayedCall(function() {
            m = true;
            Sound.fade("1_a_new_orbit_rev", 0, 0.2, 3000);
            Sound["1_a_new_orbit_rev"].loop(true).pause().play()
        }, 3000)
    })();

    function i() {
        if (Global.ELEMENTS.video) {
            Global.ELEMENTS.video.hide()
        }
        Global.ELEMENTS.satellite.edgeWidth(2);
        n = Global.ELEMENTS.trajectoryAll;
        n.reset();
        n.show();
        q = Global.ELEMENTS.earth;
        q.reset();
        q.show();
        q.showGlow();
        k = Global.ELEMENTS.sun;
        k.reset();
        k.show();
        k.mesh.position.set(0, 0, 0);
        k.object3D.position.set(10500, 0, 0);
        g = Global.ELEMENTS.stars;
        g.scale(2);
        g.reset();
        a = Global.ELEMENTS.moon;
        if (a && a.reset) {
            a.reset()
        }
        n.uniforms.trailStart.value = 0;
        n.uniforms.trailEnd.value = 0;
        n.uniforms.minOpacity.value = 1;
        n.depthWrite(true);
        n.enableLight();
        l = Global.ELEMENTS.satellite;
        l.satellite.scale.set(0.2, 0.2, 0.2);
        l.mesh.scale.set(1, 1, 1);
        l.show();
        l.color(16765440, 0.1);
        n = Global.ELEMENTS.trajectoryAll;
        n.show();
        n.mesh.position.set(0, 0, 0);
        n.uniforms.minOpacity.value = 0;
        n.uniforms.maxOpacity.value = 1;
        n.uniforms.trailEnd.value = 0.0003;
        n.uniforms.trailStart.value = 0.0003;
        n.uniforms.hardness.value = 15;
        if (!ContactDevice.PREVENT_3D) {
            Data.TRAJECTORY.orient("satellite_all", l.mesh, -100, 0.001, Math.PI, 1)
        } else {
            l.mesh.position.set(381.0709858987197, 65.38877991360329, 295.82808808003506);
            l.mesh.quaternion.set(0.5938063928344902, -0.582302134123045, -0.3837668104987205, 0.401299423852406)
        } if (c) {
            j.delayedCall(o, 200)
        }
        if (!ContactDevice.PREVENT_3D) {
            d("1978.png", 0.0001);
            d("1982.png", 0.1475);
            d("1986.png", 0.35);
            d("2014.png", 0.99985, -1, -0.5)
        }
        var r = [q.mesh, n, n.mesh, l.mesh, l.satellite, k.mesh, k.object3D, Global.ELEMENTS.dot, Global.ELEMENTS.satelliteSmall, ];
        e();
        j.delayedCall(e, 1000);
        ContactUtil.clearTweens(r)
    }

    function e() {
        Global.ELEMENTS.dot.hide();
        Global.ELEMENTS.satelliteSmall.hide();
        Global.ELEMENTS.title1.hide();
        Global.ELEMENTS.title2.hide();
        Global.ELEMENTS.title3.hide();
        Global.ELEMENTS.title4.hide();
        Global.ELEMENTS.title5.hide();
        Global.ELEMENTS.comet.hide();
        Global.ELEMENTS.moon.hide();
        Global.ELEMENTS.trajectorySmooth.hide();
        n.uniforms.minOpacity.value = 0;
        n.uniforms.maxOpacity.value = 1;
        n.uniforms.trailEnd.value = 0.0003;
        n.uniforms.trailStart.value = 0.0003;
        n.uniforms.hardness.value = 15
    }

    function d(s, v, r, x) {
        var w = new THREE.SpriteMaterial({
            map: THREE.ImageUtils.loadTexture(Config.IMAGES + "labels/" + s),
            blending: THREE.AdditiveBlending,
            transparent: true,
            color: 16777215,
            useScreenCoordinates: false,
            scaleByViewport: true,
            sizeAttenuation: false,
            depthTest: false,
            rotation: 0
        });
        var u = new THREE.Sprite(w);
        u.scale.set(1024 * 0.7, 1024 * 0.7);
        w.opacity = 0;
        w.map.offset.set(r || -1, x || -0.35);
        w.map.repeat.set(2, 2);
        Global.ELEMENTS.scene.add(u);
        p.push(u);
        Data.TRAJECTORY.orient2("satellite_all", u, 0, v, Math.PI, 1);
        return u
    }

    function h(s, r) {
        if (!j.delayedCall) {
            return
        }
        j.delayedCall(function() {
            if (!j.delayedCall) {
                return
            }
            j.tween(TweenManager.tween(r.material, {
                opacity: 1
            }, 200, "easeInSine"));
            j.tween(TweenManager.tween(r.material.map.offset, {
                x: -1,
                y: -0.5
            }, 800, "easeOutCirc"))
        }, s)
    }

    function f(s, r) {
        if (!j.delayedCall) {
            return
        }
        j.delayedCall(function() {
            if (!j.delayedCall) {
                return
            }
            j.tween(TweenManager.tween(r.material, {
                opacity: 0
            }, 500, "easeOutSine"))
        }, s)
    }

    function o() {
        Tooltips.instance().cursor(true);
        h(2200, p[0]);
        h(3000, p[1]);
        h(4500, p[2]);
        h(7700, p[3]);
        f(200 * 0 + 10700, p[0]);
        f(200 * 1 + 10700, p[1]);
        f(200 * 2 + 10700, p[2]);
        f(200 * 3 + 10700, p[3]);
        j.tween(TweenManager.tween(l.mesh.scale, {
            x: 0.001,
            y: 0.001,
            z: 0.001
        }, 500, "easeOutCubic", 2000));
        j.tween(TweenManager.tween(n.uniforms.trailEnd, {
            value: 0.35
        }, 5000, "trailDraw", 700, function() {
            j.tween(TweenManager.tween(n.uniforms.trailEnd, {
                value: 0.95
            }, 1000, "easeInOutSine", function() {
                j.tween(TweenManager.tween(n.uniforms.trailEnd, {
                    value: 0.999
                }, 1000, "easeOutCubic", function() {
                    if (!j.delayedCall) {
                        return
                    }
                    j.delayedCall(function() {
                        Global.ELEMENTS.sun.scaleOut();
                        Data.VIDEO.play(true)
                    }, 2000)
                }))
            }))
        }));
        Global.SHOT.OverviewShot.overview()
    }
    this.end = function() {
        if (m) {
            Sound.fade("1_a_new_orbit_rev", 0.2, 0, 3000, function() {
                Sound["1_a_new_orbit_rev"].pause()
            })
        }
        Global.CHAPTER_OVERVIEW = false;
        Data.MOMENTS.remove(j);
        Data.SHOTS.remove(Global.SHOT.OverviewShot)
    };
    this.destroy = function() {
        if (!this._destroy) {
            return
        }
        if (m) {
            Sound.cleanup("1_a_new_orbit_rev")
        }
        Global.CHAPTER_OVERVIEW = false;
        for (var r = 0; r < p.length; r++) {
            Global.ELEMENTS.scene.remove(p[r])
        }
        this.pause();
        this.stopTweens();
        this._destroy();
        return this._destroy = null
    }
});
Class(function TimeController() {
    Inherit(this, Component);
    var h = this;
    var g;
    var c = [];
    var b = [];
    (function() {
        d()
    })();

    function a(k, i, j) {
        return setTimeout(function() {
            if (h.tween) {
                k(j)
            }
        }, i)
    }

    function d() {
        h.events.subscribe(ContactEvents.DUMP_TWEENS, f);
        h.events.subscribe(ContactEvents.RESET_3D, e)
    }

    function f() {
        for (var j = 0; j < c.length; j++) {
            console.log(h);
            console.log(c[j]);
            console.log("---")
        }
    }

    function e() {
        for (var k = 0; k < c.length; k++) {
            var j = c[k];
            if (j && j.stop) {
                j.stop()
            }
        }
        for (k = 0; k < b.length; k++) {
            clearTimeout(b[k].timer)
        }
    }
    this.tween = function(i) {
        h = this;
        c.push(i)
    };
    this.pause = function() {
        g = true;
        for (var k = 0; k < c.length; k++) {
            var j = c[k];
            if (j && j.pause) {
                j.pause()
            }
        }
        for (k = 0; k < b.length; k++) {
            j = b[k];
            clearTimeout(j.timer);
            j.elapsed = Date.now() - j.start;
            j.remaining = j.time - j.elapsed
        }
    };
    this.resume = function() {
        g = false;
        for (var k = 0; k < c.length; k++) {
            var j = c[k];
            if (j && j.pause) {
                j.resume()
            }
        }
        var l = [];
        for (k = 0; k < b.length; k++) {
            j = b[k];
            if (j.remaining > 0) {
                l.push(j)
            }
        }
        b.length = 0;
        for (k = 0; k < l.length; k++) {
            j = l[k];
            h.delayedCall(j.callback, j.remaining, j.params)
        }
    };
    this.delayedCall = function(n, j, k, m) {
        var l = a(n, j, k);
        var i = {};
        i.timer = l;
        i.start = Date.now();
        i.end = Date.now() + j;
        i.time = j;
        i.callback = n;
        i.params = k;
        m = m || b;
        m.push(i);
        if (g) {
            clearTimeout(l);
            i.elapsed = 0;
            i.remaining = i.time
        }
    };
    this.stopTweens = function() {
        for (var k = 0; k < c.length; k++) {
            var j = c[k];
            if (j && j.stop) {
                j.stop()
            }
        }
    };
    this.destroy = function() {
        for (var k in this.classes) {
            var j = this.classes[k];
            if (j.destroy) {
                j.destroy()
            }
        }
        return null
    }
});
Class(function PlaygroundComet() {
    Inherit(this, PlaygroundViewer);
    var a = this;
    (function() {
        var b = a.init(CometElement);
        a.camera.position.z = 2000;
        b.setSize(50);
        b.visible = true
    })()
});
Class(function PlaygroundCometCore(f, d) {
    var h = this;
    var a;
    var e = Date.now();
    var c = ["x", "y", "z"];
    this.mesh = null;
    (function() {
        b();
        g()
    })();

    function b() {
        var i = {
            h: {
                type: "f",
                value: 0.86
            },
            l: {
                type: "f",
                value: 0.9
            },
            lightColor: {
                type: "c",
                value: new THREE.Color(10066329)
            }
        };
        var j = 1;
        if (!f) {
            i.h.value = 0.56;
            i.l.value = 0.8;
            i.lightColor.value = new THREE.Color(16777215)
        }
        var l = new THREE.ShaderMaterial({
            uniforms: i,
            vertexShader: Hydra.SHADERS["CometRock.vs"],
            fragmentShader: Hydra.SHADERS["CometRock.fs"]
        });
        l.transparent = true;
        if (f) {
            l.wireframe = true
        }
        if (!f) {
            l.shading = THREE.FlatShading
        }
        var k = new THREE.IcosahedronGeometry(d, j);
        h.mesh = new THREE.Mesh(k, l);
        if (!f) {
            h.mesh.matrixAutoUpdate = false
        }
    }

    function g() {
        var j = !f ? 4 : 2;
        var i = !f ? 10 : 5;
        var k = !f ? 0.0055 : 0.0025;
        a = {};
        a.x = Utils.doRandom(0, j);
        a.y = Utils.doRandom(0, j);
        a.z = Utils.doRandom(0, j);
        a.vx = i * k;
        a.vy = i * k;
        a.vz = i * k
    }
    this.update = function(l) {
        var m = (l - e) * 0.00025;
        for (var k = 0; k < 3; k++) {
            var j = c[k];
            switch (a[j]) {
                case 0:
                    h.mesh.rotation[j] += Math.cos(Math.sin(m * 0.25)) * a["v" + j];
                    break;
                case 1:
                    h.mesh.rotation[j] += Math.cos(Math.sin(m * 0.25)) * a["v" + j];
                    break;
                case 2:
                    h.mesh.rotation[j] += Math.cos(Math.cos(m * 0.25)) * a["v" + j];
                    break
            }
        }
    }
});
Class(function PlaygroundEarth() {
    Inherit(this, PlaygroundViewer);
    var a = this;
    (function() {
        a.init(EarthElement);
        a.camera.position.z = 500
    })()
});
Class(function PlaygroundLive() {
    Inherit(this, PlaygroundViewer);
    var a = this;
    (function() {
        a.init(MoonElement);
        a.camera.position.z = 500
    })()
});
Class(function PlaygroundMoon() {
    Inherit(this, PlaygroundViewer);
    var a = this;
    (function() {
        a.init(MoonElement);
        a.camera.position.z = 500
    })()
});
Class(function PlaygroundSatellite() {
    Inherit(this, PlaygroundViewer);
    var a = this;
    (function() {
        a.init(SatelliteElement);
        a.camera.position.z = 300
    })()
});
Class(function PlaygroundStars() {
    var h = this;
    var d, g, c;
    var f;
    (function() {
        e();
        b();
        Render.startRender(a)
    })();

    function e() {
        d = new THREE.Scene();
        g = new THREE.PerspectiveCamera(60, Stage.width / Stage.height, 5, 1e+27);
        g.position.z = 300;
        c = new THREE.TrackballControls(g)
    }

    function b() {
        var j = new Vector3();
        var l = new Matrix4();
        var o = new THREE.Geometry();
        for (var n = 0; n < 500; n++) {
            var k = new THREE.Vector3(0, 1, 0);
            j.set(1, 0, 0);
            l.identity().setRotation(0, Utils.toRadians(Utils.doRandom(0, 360)), Utils.toRadians(Utils.doRandom(0, 360)));
            l.transformVector(j);
            j.multiply(100);
            j.copyTo(k);
            o.vertices.push(k)
        }
        var m = new THREE.ParticleBasicMaterial({
            map: THREE.ImageUtils.loadTexture(Config.IMAGES + "elements/common/particle.png"),
            size: 5
        });
        m.depthWrite = false;
        m.transparent = true;
        f = new THREE.ParticleSystem(o, m);
        d.add(f)
    }

    function a() {
        c.update();
        Global.RENDERER.render(d, g)
    }
});
Class(function PlaygroundSun() {
    Inherit(this, PlaygroundViewer);
    var a = this;
    (function() {
        a.init(SunElement);
        a.camera.position.z = 7000;
        a.mesh.object3D.position.set(0, 0, 0)
    })()
});
Class(function PlaygroundTitle() {
    Inherit(this, RenderTarget);
    var e = this;
    var f, a, j, h, i, b;
    (function() {
        c();
        g();
        Render.startRender(d)
    })();

    function c() {
        e.init();
        f = new THREE.Scene();
        a = new THREE.PerspectiveCamera(45, Stage.width / Stage.height, 1, 10000);
        a.position.z = 3000;
        j = new THREE.TrackballControls(a, Stage.div)
    }

    function d(k) {
        Global.RENDERER.render(f, a);
        j.update()
    }

    function g() {}
});
Class(function PlaygroundTrajectory() {
    Inherit(this, PlaygroundViewer);
    var f = this;
    var g, a, l, h, i, c;
    var b = new THREE.Mesh(new THREE.BoxGeometry(100, 100, 100), new THREE.MeshNormalMaterial());
    var j = 0.02;
    var k = 0;
    (function() {
        d();
        Render.startRender(e)
    })();

    function d() {
        traj = new TrajectoryElement("satellite_all");
        sat = new SatelliteElement();
        g = new THREE.Scene();
        a = new THREE.PerspectiveCamera(45, Stage.width / Stage.height, 1, 100000);
        a.position.z = 10000;
        g.add(sat.mesh);
        g.add(traj.mesh);
        g.add(b)
    }

    function e() {
        k = Mouse.x / Stage.width;
        Global.RENDERER.render(g, a);
        Data.TRAJECTORY.orient("satellite_all", sat.mesh, 100, k % 1, 0, 1)
    }
    this.enableLight = function() {};
    this.disableLight = function() {}
});
Class(function PlaygroundViewer() {
    Inherit(this, Component);
    var e = this;
    var g, a, i;
    var f, h;
    (function() {})();

    function b() {
        g = new THREE.Scene();
        a = new THREE.PerspectiveCamera(60, Stage.width / Stage.height, 5, 1e+27);
        a.position.z = 300;
        i = new THREE.TrackballControls(a);
        e.camera = a;
        h = new THREE.WebGLRenderer();
        h.setSize(Stage.width, Stage.height);
        Stage.add(h.domElement)
    }

    function c(j, l, k) {
        f = new j(l, k);
        g.add(f.mesh);
        e.mesh = f;
        return f
    }

    function d(j) {
        if (f.update) {
            f.update(j)
        }
        if (f.render) {
            f.render(j)
        }
        i.update();
        h.render(g, a)
    }
    this.init = function(j, l, k) {
        e = this;
        b();
        var j = c(j, l, k);
        Render.startRender(d);
        return j
    }
});
Class(function SceneLive() {
    Inherit(this, View);
    var q = this;
    var f, k, u, s, b;
    var i, a;
    var c, o, d;
    (function() {
        j();
        if (!Config.HANGOUT || Global.CLEAN_HANGOUT) {
            p();
            l()
        } else {
            e()
        } if (!Global.CLEAN_HANGOUT) {
            g()
        }
        if (!Global.LIVE_LOAD) {
            h()
        }
        m();
        t();
        q.delayedCall(n, 2200)
    })();

    function j() {
        f = q.element;
        f.size("100%").setZ(100).invisible().mouseEnabled(false)
    }

    function p() {
        k = f.create("copy");
        k.fontStyle("Tungsten", 40, "#fff");
        k.css({
            textTransform: "uppercase",
            left: 50,
            letterSpacing: 4
        });
        k.text("ISEE-3 SPACECRAFT LIVE")
    }

    function l() {
        i = q.initClass(SceneLiveStats)
    }

    function e() {
        a = q.initClass(SceneLiveHangout)
    }

    function g() {
        c = [];
        for (var w = 0; w < 4; w++) {
            var v = q.initClass(GhostButton, {
                width: Mobile.phone ? 41 : 44,
                height: Mobile.phone ? 39 : 42,
                text: (w + 1).toString(),
                index: w
            });
            c.push(v)
        }
        o = c[0]
    }

    function h() {
        u = f.create(".text");
        u.fontStyle("GravurCondensed", 18, "#fff");
        u.text("CLICK AND DRAG TO EXPLORE");
        u.shrink = Mobile.phone ? 0.6 : Device.mobile ? 0.8 : 1;
        u.css({
            bottom: "5%",
            width: "100%",
            textAlign: "center",
            letterSpacing: 1
        }).setZ(5);
        b = u.create(".icon");
        b.size(52, 52).center(1, 0).css({
            top: -80
        }).bg(Config.IMAGES + "common/move.png").setZ(10);
        d = q.initClass(CSSAnimation, b);
        d.loop = true;
        d.duraton = 4000;
        d.ease = "easeInOutCubic";
        d.direction = "alternate";
        d.frames = [{
            x: -40
        }, {
            x: 40
        }];
        b.div.style[CSS.prefix("AnimationDirection")] = "alternate"
    }

    function n() {
        f.visible();
        Render.nextFrame(t);
        if (d) {
            d.play()
        }
        if (u) {
            u.css({
                opacity: 0
            }).transform({
                y: 15,
                scale: u.shrink
            }).tween({
                y: 0,
                scale: u.shrink,
                opacity: 1
            }, 500, "easeOutCubic")
        }
        if (k) {
            k.transform({
                y: -10
            }).css({
                opacity: 0
            }).tween({
                opacity: 1,
                y: 0
            }, 500, "easeOutCubic")
        }
        if (i) {
            i.animateIn()
        }
        for (var v = 0; v < c.length; v++) {
            q.delayedCall(c[v].animateIn, v * 100 + 300)
        }
        q.delayedCall(o.activate, 1500);
        q.delayedCall(function() {
            if (u) {
                u.tween({
                    y: 15,
                    scale: u.shrink,
                    opacity: 0
                }, 400, "easeInSine", function() {
                    d.stop()
                })
            }
        }, 4000);
        if (a) {
            q.delayedCall(a.animateIn, 500)
        }
    }

    function m() {
        q.events.subscribe(HydraEvents.RESIZE, t);
        if (c) {
            for (var v = 0; v < c.length; v++) {
                c[v].events.add(HydraEvents.CLICK, r)
            }
        }
    }

    function t() {
        var v = Stage.width / (1280 / 720);
        var x = Stage.height / 2 - v / 2;
        if (k) {
            k.css({
                top: x + 50
            })
        }
        if (i) {
            i.css({
                top: x + 105
            })
        }
        if (s) {
            s.css({
                bottom: x
            })
        }
        if (a) {
            a.resize(x)
        }
        if (x < 40) {
            x = 40
        }
        if (c) {
            for (var w = 0; w < c.length; w++) {
                c[w].css({
                    right: c.length * 50 - w * 50,
                    bottom: x + 50
                })
            }
        }
        if (u) {
            u.css({
                bottom: x + 50
            })
        }
        if (Mobile.phone) {
            if (k) {
                k.css({
                    top: 15,
                    fontSize: 26,
                    letterSpacing: 2,
                    left: 15
                })
            }
            if (i) {
                i.element.css({
                    top: 50,
                    left: 15
                }).transformPoint(0, 0).transform({
                    scale: 0.6
                })
            }
            for (var w = 0; w < c.length; w++) {
                c[w].css({
                    right: c.length * 50 - w * 50 - 30,
                    bottom: 19
                })
            }
        }
    }

    function r(w) {
        o.deactivate();
        o = c[w.index];
        o.activate();
        switch (w.index) {
            case 0:
                GATracker.trackEvent("clickable_link", "live", "view1");
                break;
            case 1:
                GATracker.trackEvent("clickable_link", "live", "view2");
                break;
            case 2:
                GATracker.trackEvent("clickable_link", "live", "view3");
                break;
            case 3:
                GATracker.trackEvent("clickable_link", "live", "view4");
                break
        }
        if (c) {
            for (var v = 0; v < c.length; v++) {
                if (c[v] !== o) {
                    c[v].disable()
                }
            }
        }
        q.delayedCall(function() {
            if (c) {
                for (var x = 0; x < c.length; x++) {
                    if (c[x] !== o) {
                        c[x].enable()
                    }
                }
            }
        }, 2600);
        Global.SHOT.LiveShot.camera(w.index)
    }
    this.animateIn = function() {}
});
Class(function SceneLiveHangout() {
    Inherit(this, View);
    var p = this;
    var c, j, r, e, w;
    var b, m, g, a;
    p.width = 320;
    p.height = 180;
    (function() {
        s();
        t();
        d();
        k();
        n();
        f();
        l()
    })();

    function s() {
        c = p.element;
        c.size("100%").setZ(1000).invisible().mouseEnabled(false)
    }

    function d() {
        e = c.create("video");
        e.size(p.width, p.height).bg("#000").css({
            opacity: 0
        }).setZ(2);
        e.banner = e.create(".banner");
        e.banner.size(p.width, 50).css({
            bottom: -50
        }).transform({
            y: -50
        }).bg(Config.IMAGES + "live/banner.png");
        e.bannerHover = e.banner.create(".banner");
        e.bannerHover.size(p.width, 50).css({
            opacity: 0
        }).bg(Config.IMAGES + "live/banner-hover.png");
        var y = e.banner.create(".copy");
        y.fontStyle("GravurCondensed", 14, "#fff");
        y.css({
            left: 15,
            letterSpacing: 1,
            top: 6
        });
        y.text("ISEE-3 Control Center");
        var z = e.banner.create(".copy");
        z.fontStyle("GravurCondensed", 14, "#fff");
        z.css({
            left: 15,
            letterSpacing: 1,
            top: 24
        });
        z.text("McMoon, California, USA");
        e.inner = e.create(".wrapper");
        e.inner.size("100%").bg("#000");
        e.wrap = e.inner.create(".wrap");
        e.wrap.size("100%");
        e.icon = e.create(".wrapper");
        e.icon.size(50, 50).css({
            opacity: 0
        }).center().bg(Config.IMAGES + "live/expand.png").setZ(5).transform({
            scale: 0.9
        });
        var x = e.wrap.create(".frame");
        x.size("100%");
        x.div.setAttribute("id", "youtube")
    }

    function t() {
        r = c.create(".copy");
        r.fontStyle("GravurCondensed", 14, "#fff");
        r.css({
            left: 0,
            letterSpacing: 1,
            lineHeight: 22
        }).setZ(10);
        r.html("Questions? #ISEE3")
    }

    function n() {
        j = c.create("copy");
        j.fontStyle("Tungsten", 40, "#fff");
        j.css({
            textTransform: "uppercase",
            left: 50,
            letterSpacing: 4
        }).setZ(10);
        j.text("ISEE-3 live lunar flyby ")
    }

    function k() {
        g = p.initClass(SceneLiveStats);
        g.element.setZ(1)
    }

    function f() {
        w = c.create(".return");
        w.down = true;
        w.size(p.width, p.height).bg("#000").css({
            opacity: 0
        }).setZ(2).hide();
        w.banner = w.create(".banner");
        w.banner.size(p.width, 50).css({
            bottom: -50
        }).transform({
            y: -50
        }).bg(Config.IMAGES + "live/banner.png");
        w.bannerHover = w.banner.create(".banner");
        w.bannerHover.size(p.width, 50).css({
            opacity: 0
        }).bg(Config.IMAGES + "live/banner-hover.png");
        var x = w.banner.create(".copy");
        x.fontStyle("GravurCondensed", 14, "#fff");
        x.css({
            left: 15,
            letterSpacing: 1,
            top: 6
        });
        x.text("ISEE-3 Spacecraft");
        w.stat = w.banner.create(".copy");
        w.stat.fontStyle("GravurCondensed", 14, "#fff");
        w.stat.css({
            left: 15,
            letterSpacing: 1,
            top: 24
        });
        w.inner = w.create(".return");
        w.inner.size("100%").bg("#000");
        w.wrap = w.inner.create(".wrap");
        w.wrap.size("100%");
        w.icon = w.create(".wrapper");
        w.icon.size(50, 50).css({
            opacity: 0
        }).center().bg(Config.IMAGES + "live/minimize.png").setZ(5).transform({
            scale: 1.1
        })
    }

    function q() {
        var x = Global.RENDERER.domElement.toDataURL();
        w.inner.addChild(Global.RENDERER.domElement);
        Global.GL.setSize(p.width, p.height);
        Global.RENDERER.domElement.style.top = "0px"
    }

    function o(y) {
        var z = y.toString().split(".");
        z[0] = z[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return z.join(".")
    }

    function u() {
        var x = Global.LIVE_STATS.moon;
        x = o(x);
        w.stat.text(x + " km from the Moon")
    }

    function l() {
        e.interact(v, h);
        e.hit.mouseEnabled(true);
        w.interact(v, i);
        w.hit.mouseEnabled(true)
    }

    function v(x) {
        if (x.object.expanded || p.animating) {
            return
        }
        switch (x.action) {
            case "over":
                x.object.bannerHover.tween({
                    opacity: 1
                }, 100, "easeOutSine");
                x.object.wrap.tween({
                    opacity: 0.7
                }, 100, "easeOutSine");
                x.object.icon.tween({
                    opacity: 1,
                    scale: 1
                }, 300, "easeOutCubic");
                break;
            case "out":
                x.object.bannerHover.tween({
                    opacity: 0
                }, 100, "easeOutSine");
                x.object.wrap.tween({
                    opacity: 1
                }, 300, "easeOutSine");
                x.object.icon.tween({
                    opacity: 0,
                    scale: x.object.down ? 1.1 : 0.9
                }, 300, "easeOutCubic");
                break
        }
    }

    function h() {
        if (e.expanded) {
            return
        }
        v({
            action: "out",
            object: e
        });
        v({
            action: "out",
            object: w
        });
        e.expanded = true;
        e.hit.hide();
        p.animating = true;
        e.banner.tween({
            y: -50
        }, 100, "easeOutCubic");
        GATracker.trackEvent("clickable_link", "live", "expandvideo");
        e.stopTween().tween({
            top: a,
            right: 0,
            width: Stage.width,
            height: Stage.width / (1280 / 720)
        }, 650, "easeInOutQuart", function() {
            w.banner.tween({
                y: 0
            }, 500, "easeOutCubic");
            p.animating = false;
            q();
            Render.startRender(u);
            w.show().css({
                opacity: 0
            }).tween({
                opacity: 1
            }, 300, "easeOutSine", 100)
        })
    }

    function i() {
        if (!e.expanded) {
            return
        }
        v({
            action: "out",
            object: e
        });
        v({
            action: "out",
            object: w
        });
        GATracker.trackEvent("clickable_link", "live", "interactive");
        Render.stopRender(u);
        e.expanded = false;
        p.animating = true;
        w.banner.tween({
            y: -50
        }, 100, "easeOutCubic");
        w.stopTween().tween({
            opacity: 0
        }, 200, "easeOutSine", function() {
            w.hide();
            Global.GL.reset()
        });
        e.stopTween().tween({
            top: m == 40 ? 50 : m + 50,
            right: 50,
            width: p.width,
            height: p.height
        }, 650, "easeInOutQuart", function() {
            p.animating = false;
            e.hit.show();
            e.banner.tween({
                y: 0
            }, 500, "easeOutCubic")
        })
    }
    this.animateIn = function() {
        b = new YT.Player("youtube", {
            height: p.width,
            width: p.height,
            videoId: Config.HANGOUT_ID,
            playerVars: {
                controls: 0,
                showinfo: 0,
                autoplay: 1
            }
        });
        c.visible();
        j.transform({
            y: -10
        }).css({
            opacity: 0
        }).tween({
            opacity: 1,
            y: 0
        }, 500, "easeOutCubic");
        g.animateIn();
        e.tween({
            opacity: 1
        }, 500, "easeOutSine", 500);
        e.banner.tween({
            y: 0
        }, 500, "easeOutCubic")
    };
    this.resize = function(x) {
        a = x;
        m = x;
        if (m < 40) {
            m = 40
        }
        if (j) {
            j.css({
                bottom: m + 80
            })
        }
        if (g) {
            g.css({
                bottom: m + 125
            })
        }
        if (r) {
            r.css({
                bottom: m + 45,
                left: 50
            })
        }
        if (e.expanded) {
            e.css({
                top: m,
                right: 0,
                width: Stage.width,
                height: Stage.width / (1280 / 720)
            })
        } else {
            e.css({
                top: m == 40 ? 50 : m + 50,
                right: 50,
                width: p.width,
                height: p.height
            })
        }
        w.css({
            top: m + 50,
            right: 50,
            width: p.width,
            height: p.height
        })
    }
});
Class(function SceneLiveStats() {
    Inherit(this, View);
    var j = this;
    var o, p, c, d, k;
    var m;
    Global.LIVE_STATS = {
        moon: 26455,
        earth: 46246,
        sun: 8.766
    };
    (function() {
        g();
        n();
        l();
        f();
        e()
    })();

    function g() {
        o = j.element;
        o.size(341, 170).css({
            left: 50
        }).invisible()
    }

    function n() {
        p = o.create(".copy");
        p.fontStyle("GravurCondensed", 14, "#fff");
        p.css({
            left: 0,
            letterSpacing: 1
        });
        p.text("Date / Time:")
    }

    function l() {
        c = o.create(".copy");
        c.fontStyle("GravurCondensed", 14, "#fff");
        c.css({
            right: 0,
            textAlign: "right",
            letterSpacing: 1,
            textTransform: "uppercase"
        })
    }

    function f() {
        var t = [{
            type: "moon",
            title: "Distance to Moon:",
            unit: "km"
        }, {
            type: "earth",
            title: "Distance to Earth:",
            unit: "km"
        }, {
            type: "sun",
            title: "Distance to Sun:",
            unit: "AU"
        }];
        m = [];
        for (var s = 0; s < t.length; s++) {
            var r = o.create(".stat");
            r.css({
                width: "100%",
                height: 22,
                top: s * 24 + 24
            });
            r.type = t[s].type;
            var u = r.create(".copy");
            u.fontStyle("GravurCondensed", 14, "#fff");
            u.css({
                left: 0,
                letterSpacing: 1
            });
            u.text(t[s].title);
            r.stat = r.create(".copy");
            r.stat.fontStyle("GravurCondensed", 14, "#fff");
            r.stat.css({
                right: 0,
                textAlign: "right",
                letterSpacing: 1
            });
            r.stat.unit = t[s].unit;
            r.stat.num = new Vector2();
            r.stat.num.x = 0;
            m.push(r)
        }
    }

    function e() {
        d = o.create(".copy");
        d.fontStyle("GravurCondensed", 14, "#fff");
        d.css({
            left: 0,
            letterSpacing: 1,
            top: m.length * 24 + 35,
            lineHeight: 22
        });
        d.html("Live simulation is an artistic interpretation of a trajectory model made by ");
        k = d.create(".copy", "a");
        k.fontStyle("GravurCondensed", 14, "#3ff8cb");
        k.div.href = "http://blogs.agi.com/agi/2014/06/23/ads-helps-reboot-isee-3-with-odtk-and-stkastrogator/";
        k.div.target = "_blank";
        k.css({
            position: "relative",
            display: "inline-block",
            letterSpacing: 1
        });
        k.html("ADS/SEE.");
        k.click(q)
    }

    function q() {
        GATracker.trackEvent("clickable_link", "live", "ADSSEE")
    }
    var b = new Date();

    function i() {
        b.setTime(Global.LIVE_STATS.time);
        var v = b.getFullYear();
        var t = b.getDate();
        var s = b.getHours();
        var y = b.getMinutes();
        var u = b.getSeconds();
        var r = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        var x = r[b.getMonth()];
        if (t.toString().length == 1) {
            t = "0" + t
        }
        if (s.toString().length == 1) {
            s = "0" + s
        }
        if (y.toString().length == 1) {
            y = "0" + y
        }
        if (u.toString().length == 1) {
            u = "0" + u
        }
        var w = t + " " + x + " " + v + " / " + s + ":" + y + ":" + u;
        return w
    }

    function a(r) {
        var s = r.toString().split(".");
        s[0] = s[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return s.join(".")
    }

    function h() {
        c.div.innerHTML = i();
        for (var r = 0; r < m.length; r++) {
            var s = Global.LIVE_STATS[m[r].type];
            s = a(s);
            m[r].stat.div.innerHTML = s + " " + m[r].stat.unit
        }
    }
    this.animateIn = function() {
        o.visible();
        Render.startRender(h);
        p.transform({
            y: 10
        }).css({
            opacity: 0
        }).tween({
            opacity: 1,
            y: 0
        }, 500, "easeOutCubic");
        c.transform({
            y: 10
        }).css({
            opacity: 0
        }).tween({
            opacity: 1,
            y: 0
        }, 500, "easeOutCubic", 50);
        for (var r = 0; r < m.length; r++) {
            m[r].transform({
                y: 10
            }).css({
                opacity: 0
            }).tween({
                opacity: 1,
                y: 0
            }, 500, "easeOutCubic", r * 100 + 100)
        }
        d.transform({
            y: 10
        }).css({
            opacity: 0
        }).tween({
            opacity: 1,
            y: 0
        }, 500, "easeOutCubic", m.length * 100 + 100)
    };
    this.animateOut = function() {
        Render.stopRender(h);
        p.tween({
            opacity: 0,
            y: 10
        }, 500, "easeOutCubic", m.length * 30 + 90);
        c.tween({
            opacity: 0,
            y: 10
        }, 500, "easeOutCubic", m.length * 30 + 60);
        for (var r = 0; r < m.length; r++) {
            m[r].tween({
                opacity: 0,
                y: 10
            }, 500, "easeOutCubic", r * 30 + 30)
        }
        d.tween({
            opacity: 0,
            y: 10
        }, 500, "easeOutCubic", 30)
    }
});
Class(function RenderLayerGL(e, j, m) {
    Inherit(this, Component);
    var f = this;
    var g, a, i;
    var b, k;
    var l = [];
    this.visible = true;
    this.renderTarget = null;
    this.mesh = null;
    this.camera = null;
    this.scene = null;
    this.z = 0;
    (function() {
        d();
        if (e) {
            c()
        }
        if (j) {
            h()
        }
    })();

    function d() {
        g = new THREE.Scene();
        a = new THREE.OrthographicCamera(Stage.width / -2, Stage.width / 2, Stage.height / 2, Stage.height / -2, -500, 1000);
        a.matrixAutoUpdate = false;
        f.scene = g;
        f.camera = a
    }

    function c() {
        var o = new THREE.PlaneGeometry(e.renderTarget.width, e.renderTarget.height);
        var n = new THREE.MeshBasicMaterial({
            color: 16777215,
            map: e.renderTarget
        });
        if (!m) {
            n.transparent = true
        }
        i = new THREE.Mesh(o, n);
        i.matrixAutoUpdate = false;
        f.mesh = i;
        if (!f.visible) {
            n.visible = false
        }
        if (k) {
            i.position.y = Config.TIMELINE_HEIGHT / 2
        }
        if (!b) {
            g.add(i)
        } else {
            i.position.z = f.z;
            i.updateMatrix();
            b.scene.add(i)
        }
    }

    function h(p, n) {
        p = p || Stage.width;
        n = n || Stage.height;
        if (f.video) {
            n = Stage.height
        }
        if (f.renderTarget) {
            f.renderTarget.dispose()
        }
        var o = _transparent ? {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.NearestFilter,
            format: THREE.RGBAFormat,
            stencilBuffer: false
        } : null;
        f.renderTarget = new THREE.WebGLRenderTarget(p, n, o);
        f.renderTarget.generateMipmaps = false
    }
    this.resize = function(q, n) {
        if (f.renderTarget) {
            h(q, n)
        }
        a.left = q / -2;
        a.right = q / 2;
        a.top = n / 2;
        a.bottom = n / -2;
        a.near = -500;
        a.far = 1000;
        a.updateProjectionMatrix();
        g = new THREE.Scene();
        f.scene = g;
        if (i) {
            g.remove(i);
            i.geometry.dispose();
            i.material.dispose();
            c()
        }
        for (var p = 0; p < l.length; p++) {
            var o = l[p];
            o.resize(q, n)
        }
    };
    this.render = function(n) {
        Global.RENDERER.render(g, a, f.renderTarget)
    };
    this.compensate = function() {
        i.position.y = Config.TIMELINE_HEIGHT / 2;
        k = true
    };
    this.add = function(o, p, n) {
        if (o.addedToParent) {
            o.addedToParent(f)
        }
        g.add(o.mesh);
        o.z = o.mesh.position.z = p;
        o.mesh.updateMatrix();
        l.push(o)
    };
    this.addedToParent = function(n) {
        g.remove(i);
        b = n
    };
    this.hide = function() {
        this.visible = false;
        this.mesh.material.visible = false
    };
    this.show = function() {
        this.visible = true;
        this.mesh.material.visible = true
    }
});
Class(function RenderTarget() {
    Inherit(this, Events);
    var a = this;
    this.scene = new THREE.Scene();
    this.camera = Data.CAMERA.orbitCamera;
    (function() {})();
    this.render = function() {
        if (this.visible) {
            Global.RENDERER.render(this.scene, this.camera)
        }
    }
});
Class(function SceneRendererGL(n) {
    Inherit(this, Component);
    var g = this;
    var a;
    var k, b, j;
    var h, o, d;
    var m = {};
    var f = {};
    (function() {
        l();
        i();
        g.delayedCall(c, 100)
    })();

    function l() {
        k = new THREE.WebGLRenderer({
            antialias: !Device.system.retina && !Device.browser.chrome,
            preserveDrawingBuffer: Config.HANGOUT
        });
        k.setSize(Stage.width, Data.VIDEO.height);
        k.autoClear = false;
        k.autoClearDepth = true;
        k.autoClearStencil = false;
        Global.RENDERER = k;
        Global.GL = g;
        g.domElement = k.domElement;
        a = $(g.domElement);
        g.object = a
    }

    function e() {
        k.clear(true, true, true);
        if (!g.flip) {
            f.space.render();
            if (f.video) {
                f.video.render()
            }
            k.clear(false, true, true);
            f.view.render()
        } else {
            f.view.render();
            k.clear(true, true, true);
            if (f.video) {
                f.video.render()
            }
        }
    }

    function i() {
        g.events.subscribe(HydraEvents.RESIZE, c)
    }

    function c() {
        if (g.noResize) {
            return
        }
        var p = Stage.width / (1280 / 720);
        g.y = (Stage.height / 2 - p / 2);
        k.setSize(Stage.width, p);
        k.domElement.style.top = g.y + "px";
        Global.VIDEO_TOP_Y = g.y;
        if (ContactDevice.KILL_RETINA) {
            k.setSize(Stage.width / 2, p / 2);
            k.setViewport(0, 0, Stage.width / 2, p / 2);
            k.domElement.style.width = Stage.width + "px";
            k.domElement.style.height = p + "px"
        }
        Data.CAMERA.updateProjection()
    }
    this.register = function(p, q) {
        f[p] = q;
        Render.startRender(e)
    };
    this.hideLayer = function(p) {};
    this.showLayer = function(p) {};
    this.fade = function(s, p, q, r) {
        a.tween({
            opacity: s
        }, p, q, r)
    };
    this.reset = function() {
        g.flip = false
    };
    this.pause = function() {
        Render.stopRender(e)
    };
    this.resume = function() {
        Render.startRender(e)
    };
    this.hide = function() {
        a.hide()
    };
    this.show = function() {
        a.show()
    };
    this.setSize = function(p, q) {
        g.noResize = true;
        k.setSize(p, q)
    };
    this.reset = function() {
        g.noResize = false;
        n.add(k.domElement);
        c()
    }
});
Class(function SceneTitle(a, c) {
    Inherit(this, View);
    var h = this;
    var g;
    var e, f;
    (function() {
        d();
        b(c)
    })();

    function d() {
        g = h.element;
        e = g.create("heading");
        e.css({
            fontFamily: "Tungsten",
            color: "#fff",
            whiteSpace: "nowrap",
            position: "relative",
            textTransform: "uppercase"
        });
        f = g.create("sub-heading");
        f.css({
            fontFamily: "Tungsten",
            color: "#fff",
            whiteSpace: "nowrap",
            fontSize: Stage.width * 0.023,
            letterSpacing: Stage.width * 0.002,
            position: "relative",
            textTransform: "uppercase",
            marginTop: -Stage.width * 0.002
        })
    }

    function b(i) {
        var l;
        if (Stage.height - Config.TIMELINE_HEIGHT < i) {
            l = (i - Stage.height) / 2 + Config.TIMELINE_HEIGHT / 2
        }
        var j = l ? l + Stage.width * 0.06 : Stage.width * 0.06;
        var k = {
            bottom: j
        };
        if (a != "center") {
            k[a] = Stage.width * 0.03;
            g.css(k)
        }
        e.css({
            fontSize: 40,
            letterSpacing: 5
        });
        f.css({
            fontSize: 22,
            letterSpacing: 3
        });
        if (a == "center") {
            g.css({
                width: "100%",
                bottom: i * 0.5
            });
            e.css({
                width: "100%",
                textAlign: "center"
            });
            f.css({
                width: "100%",
                textAlign: "center"
            })
        }
        if (a == "center_top") {
            g.css({
                width: 260,
                left: "50%",
                marginLeft: -130,
                bottom: i * 0.75
            });
            e.css({
                width: "100%",
                textAlign: "left",
                fontSize: 80,
                letterSpacing: 10,
                textTransform: "none"
            });
            f.css({
                width: "100%",
                textAlign: "center"
            })
        }
    }
    this.show = function(i) {
        if (!Config.TITLES) {
            return
        }
        e.text(i.heading);
        f.text(i.subheading)
    };
    this.hide = function() {
        e.text("");
        f.text("")
    };
    this.resize = b
});
Class(function SceneVideoGL() {
    Inherit(this, Component);
    var g = this;
    var i, b, j, c;
    var h, k;
    var l;
    this.visible = true;
    (function() {
        a();
        f();
        d()
    })();

    function a() {
        c = Data.VIDEO.reference;
        Global.ELEMENTS.video = g
    }

    function f() {
        h = new THREE.Texture(c.div);
        var n = new THREE.PlaneGeometry(1280, 720);
        var m = new THREE.ShaderMaterial({
            uniforms: {
                map: {
                    type: "t",
                    value: h
                },
                opacity: {
                    type: "f",
                    value: 1
                },
                reveal: {
                    type: "f",
                    value: 0
                },
                power: {
                    type: "f",
                    value: 1
                }
            },
            transparent: true,
            vertexShader: Hydra.SHADERS["VideoShader.vs"],
            fragmentShader: Hydra.SHADERS["VideoShader.fs"],
            depthWrite: false
        });
        k = new THREE.Mesh(n, m);
        g.material = m;
        if (!Global.INIT_MOMENT) {
            m.uniforms.opacity.value = 0
        }
        Global.GL.register("video", g);
        Global.SCENE.video = g
    }

    function e() {
        var m = Stage.width / 1280;
        k.scale.set(m, m, 1)
    }

    function d() {
        i = new THREE.Scene();
        b = new THREE.PerspectiveCamera(45, Stage.width / Data.VIDEO.height, 1, 100000);
        b.position.z = 869;
        b.matrixAutoUpdate = false;
        b.updateMatrix();
        i.add(k)
    }
    this.show = function(m) {
        this.visible = true
    };
    this.hide = function(m) {
        this.visible = false
    };
    this.swap = function() {
        if (g.visible) {
            g.visible = false;
            k.material.uniforms.opacity.value = 0
        }
    };
    this.setOpacity = function(m) {
        k.material.uniforms.opacity.value = m;
        this.visible = true
    };
    this.fade = function(p, n, o, m) {
        return TweenManager.tween(k.material.uniforms.opacity, {
            value: p
        }, n, o, m || 0)
    };
    this.reveal = function(p, n, o, m) {
        return TweenManager.tween(k.material.uniforms.reveal, {
            value: p
        }, n, o, m || 0)
    };
    this.setReveal = function(m) {
        k.material.uniforms.reveal.value = m
    };
    this.setRevealStrength = function(m) {
        k.material.uniforms.power.value = m
    };
    this.render = function() {
        if (c.ready()) {
            h.needsUpdate = true
        }
        if (this.visible) {
            Global.RENDERER.render(i, b)
        }
    };
    this.reset = function() {
        this.visible = true;
        this.setOpacity(1)
    }
});
Class(function SceneView() {
    Inherit(this, RenderTarget);
    var f = this;
    var c, b, a;
    this.visible = true;
    (function() {
        Global.GL.register("view", f);
        Global.SCENE_VIEW = f;
        d()
    })();

    function e() {
        if (c) {
            c.dispose()
        }
        c = f.composer = new THREE.EffectComposer(Global.RENDERER, f.renderTarget);
        c.addPass(new THREE.RenderPass(f.scene, f.camera));
        var g = new SceneViewOpacityShader();
        a = new THREE.ShaderPass(g);
        c.addPass(a)
    }

    function d() {
        f.events.subscribe(ContactEvents.RESIZE, e)
    }
    this.hide = function(g) {
        this.visible = false
    };
    this.show = function() {
        this.visible = true
    }
});
Class(function SceneViewOpacityShader() {
    var a = this;
    this.uniforms = {
        opacity: {
            type: "f",
            value: 1
        },
        tDiffuse: {
            type: "t",
            value: null
        },
    };
    this.vertexShader = Hydra.SHADERS["BasicVertex.vs"];
    this.fragmentShader = Hydra.SHADERS["SceneOpacity.fs"]
});
Class(function ANewOrbitShot(c) {
    Inherit(this, TimeController);
    var i = this;
    var a, g;
    var b = Global.INIT_MOMENT.strpos("aneworbit") || Global.CHAPTER_SEEK;
    (function() {
        e();
        d();
        if (!b) {
            Render.nextFrame(j)
        } else {
            Render.startRender(f)
        }
    })();

    function e() {
        a = i.initClass(Camera, Global.ELEMENTS.satellite.mesh);
        a.applyState(c.camera1);
        a.position.multiplyScalar(0.2);
        if (b) {
            a.forceFOV(60)
        } else {
            a.fov = 60
        }
        Data.CAMERA.minPolarAngle = Utils.toRadians(80);
        Data.CAMERA.maxPolarAngle = Utils.toRadians(100);
        Data.CAMERA.minTheta = Utils.toRadians(-10);
        Data.CAMERA.maxTheta = Utils.toRadians(10);
        a.offsetX(-0.2);
        a.position.y -= 3;
        if (b) {
            Data.CAMERA.pivot(true);
            Data.CAMERA.target(a);
            Data.CAMERA.reset()
        }
        Data.CAMERA.alpha = 1;
        Data.CAMERA.sync()
    }

    function d() {
        g = i.initClass(Camera, Global.ELEMENTS.satellite.mesh);
        g.applyState(c.camera2);
        g.fov = 60
    }

    function j() {
        if (b || Global.CHAPTER_SEEK) {
            return
        }
        Data.CAMERA.alpha = 0.00002;
        Data.CAMERA.tweenTarget(a, 4000, "cameraZoomIn", 0, null, function() {
            Render.startRender(f);
            if (Global.MOMENT.OverviewMoment) {
                Global.MOMENT.OverviewMoment.end()
            }
        });
        i.tween(TweenManager.tween(Global.ELEMENTS.trajectoryAll.uniforms.minOpacity, {
            value: 0
        }, 2000, "cameraZoomIn"));
        i.tween(TweenManager.tween(Global.ELEMENTS.trajectoryAll.uniforms.maxOpacity, {
            value: 0
        }, 4000, "cameraZoomIn", 500))
    }

    function h() {
        Global.MOMENT.ANewOrbit.animateOut();
        Render.stopRender(f);
        Data.CAMERA.tweenTarget(g, 2000, "easeInQuint", 0, null, function() {
            if (Global.MOMENT.ANewOrbit) {
                Global.MOMENT.ANewOrbit.end()
            }
        })
    }

    function f(k) {
        Data.CAMERA.alpha = 0.04 + Math.sin(k * 0.00075) * 0.03
    }
    this.setTimers = function() {
        i.delayedCall(h, 7500)
    };
    this.destroy = function() {
        Render.stopRender(f);
        return this._destroy()
    }
});
Class(function L1DemoShot(c) {
    Inherit(this, TimeController);
    var g = this;
    var f, e;
    (function() {
        b();
        a()
    })();

    function b() {
        f = g.initClass(Camera);
        f.forceFOV(45);
        Data.CAMERA.alpha = 1;
        Data.CAMERA.orbitFriction = 1.25;
        Data.CAMERA.pivot(true);
        Data.CAMERA.setPlanes(2500, 8000);
        Data.CAMERA.minPolarAngle = Utils.toRadians(50);
        Data.CAMERA.maxPolarAngle = Utils.toRadians(120);
        Data.CAMERA.minTheta = Utils.toRadians(-90);
        Data.CAMERA.maxTheta = Utils.toRadians(90);
        f.applyState(c.camera1);
        f.orbitDistance = f.position.length();
        Data.CAMERA.target(f);
        if (Global.PREVIEW) {
            Global.ELEMENTS.video.swap();
            Data.CAMERA.sync();
            Data.CAMERA.pivot(true)
        }
    }

    function a() {
        var h = [{
            x: Global.ELEMENTS.sun.object3D.position.x,
            y: 0,
            z: 0,
            w: 800,
            h: 800,
            d: 800,
            name: "sun"
        }, {
            x: Global.ELEMENTS.earth.object3D.position.x,
            y: 0,
            z: 0,
            w: 400,
            h: 400,
            d: 400,
            name: "earth"
        }, {
            x: -900,
            y: 0,
            z: 0,
            w: 400,
            h: 1000,
            d: 400,
            name: "halo-orbit"
        }, ];
        e = g.initClass(InteractiveElements, h);
        e.events.add(HydraEvents.CLICK, d);
        if (Global.PREVIEW && !Device.mobile) {
            Tooltips.instance().animateIn()
        }
    }

    function d(h) {
        Tooltips.instance().hoverIn(1, h.name)
    }
    this.interact = function() {};
    this.activate = function() {
        Data.CAMERA.orbitFriction = 1.75;
        e.addListeners();
        Data.CAMERA.dragMode(true);
        Global.INTERACTIVE_MOMENT = true
    };
    this.destroy = function() {
        Global.INTERACTIVE_MOMENT = false;
        Data.CAMERA.resetPlanes();
        Data.CAMERA.dragMode(false);
        return g._destroy()
    }
});
Class(function CometHunterShot(b) {
    Inherit(this, TimeController);
    var e = this;
    var f, a, c;
    var h = Global.INIT_MOMENT.strpos("comet-hunter") || Global.CHAPTER_SEEK;
    (function() {
        if (!h) {
            Data.CAMERA.resetTween(3000, "easeInOutCubic")
        } else {
            Data.CAMERA.reset()
        }
        Data.CAMERA.setPlanes(500, 8000);
        if (Global.PREVIEW || h) {
            Global.ELEMENTS.video.swap()
        }
        i();
        if (!Global.CHAPTER_SEEK) {
            e.delayedCall(g, 100)
        }
    })();

    function d() {
        if (!h) {
            return
        } else {
            if (!Global.PREVIEW) {
                return Global.ELEMENTS.video.swap()
            }
        }
        Data.CAMERA.reset();
        f = e.initClass(Camera);
        f.forceFOV(45);
        Data.CAMERA.alpha = 0.02;
        Data.CAMERA.sync();
        f.applyState(b.camera1);
        Data.CAMERA.pivot(true);
        window.camera = f
    }

    function i() {
        Data.CAMERA.alpha = 0.02;
        a = e.initClass(Camera);
        a.fov = 45;
        if (h) {
            a.forceFOV(45)
        }
        Data.CAMERA.minPolarAngle = Utils.toRadians(70);
        Data.CAMERA.maxPolarAngle = Utils.toRadians(100);
        Data.CAMERA.orbitFriction = 0.4;
        Data.CAMERA.minTheta = Utils.toRadians(-40);
        Data.CAMERA.maxTheta = Utils.toRadians(40);
        Data.CAMERA.alpha = 0.02;
        Data.CAMERA.sync();
        a.orbitDistance = 800;
        a.applyState(b.camera3);
        a.offsetX(0.25);
        if (h) {
            Data.CAMERA.minPolarAngle = Utils.toRadians(70);
            Data.CAMERA.maxPolarAngle = Utils.toRadians(110);
            Data.CAMERA.minTheta = Utils.toRadians(-70);
            Data.CAMERA.maxTheta = Utils.toRadians(70);
            Data.CAMERA.target(a);
            Data.CAMERA.reset();
            Data.CAMERA.sync()
        }
    }

    function g() {
        if (h) {
            return
        }
        e.delayedCall(function() {
            Data.CAMERA.tweenTarget(a, 5000, "easeInOutCubic", 0, null, function() {
                Data.CAMERA.pivot(true);
                Data.CAMERA.minPolarAngle = Utils.toRadians(70);
                Data.CAMERA.maxPolarAngle = Utils.toRadians(110);
                Data.CAMERA.minTheta = Utils.toRadians(-70);
                Data.CAMERA.maxTheta = Utils.toRadians(70)
            })
        }, h ? 500 : 1)
    }

    function j() {
        c = e.initClass(Camera);
        c.forceFOV(60);
        Data.CAMERA.alpha = 1;
        window.camera = c;
        Data.CAMERA.pivot(false);
        Data.CAMERA.target(c);
        c.offsetX(0.2);
        c.applyState(b.camera3)
    }
});
Class(function CometTailShot(d) {
    Inherit(this, TimeController);
    var j = this;
    var a, e, b;
    var n;
    var c = new THREE.Vector3();
    var f = new THREE.Vector3();
    (function() {
        l();
        h();
        g()
    })();

    function h() {
        a = j.initClass(Camera);
        a.fov = 60;
        a.applyState(d.camera2);
        Data.CAMERA.alpha = 1;
        Data.CAMERA.sync();
        Data.CAMERA.reset();
        a.orbitDistance = a.position.length() / 2;
        f.copy(a.position)
    }

    function l() {
        b = j.initClass(Camera);
        b.forceFOV(60);
        b.applyState(d.camera4);
        b.orbitDistance = b.position.length();
        Data.CAMERA.target(b);
        Data.CAMERA.alpha = 1;
        Data.CAMERA.sync()
    }

    function o() {
        e = j.initClass(Camera);
        e.initControls(THREE.OrbitControls);
        e.forceFOV(60);
        Data.CAMERA.alpha = 1;
        window.camera = e;
        Data.CAMERA.pivot(false);
        Data.CAMERA.target(e)
    }

    function k() {
        Data.CAMERA.orbitFriction = 1.2;
        j.delayedCall(function() {
            Data.CAMERA.tweenTarget(a, 3500, "easeInOutCubic")
        }, 10500)
    }

    function g() {
        var p = [{
            x: 2300,
            y: 700,
            z: -100,
            w: 600,
            h: 400,
            d: 400,
            rx: 0,
            ry: 90,
            rz: 40,
            name: "comet"
        }, {
            x: 2638,
            y: 119,
            z: 209,
            w: 250,
            h: 250,
            d: 250,
            name: "satellite"
        }, {
            x: 0,
            y: 0,
            z: 0,
            w: 1200,
            h: 1200,
            d: 1200,
            name: "trajectory"
        }, ];
        n = j.initClass(InteractiveElements, p);
        n.events.add(HydraEvents.HOVER, i);
        n.events.add(HydraEvents.CLICK, m)
    }

    function m(p) {
        Tooltips.instance().hoverIn(2, p.name)
    }

    function i(p) {
        if (p.type == "over") {
            Tooltips.instance().hoverIn(2, p.name)
        } else {
            Tooltips.instance().hoverOut()
        }
    }
    this.end = function() {
        Data.SHOTS.remove(j)
    };
    this.animateIn = function() {
        k()
    };
    this.target = function() {
        Data.CAMERA.reset();
        Data.CAMERA.alpha = 0.02;
        Data.CAMERA.sync()
    };
    this.activate = function() {
        Tooltips.instance().animateIn();
        n.addListeners();
        Global.INTERACTIVE_MOMENT = true
    };
    this.destroy = function() {
        Global.INTERACTIVE_MOMENT = false;
        return this._destroy()
    }
});
Class(function FarquarManeuverShot(b) {
    Inherit(this, TimeController);
    var e = this;
    var d, c, a;
    (function() {
        Data.CAMERA.resetPlanes();
        d = e.initClass(Camera);
        d.applyState(b.camera1);
        d.orbitDistance = d.position.length();
        c = e.initClass(Camera);
        c.position.z = 100000;
        a = e.initClass(Camera, Global.ELEMENTS.satelliteSmall.mesh);
        a.position.z = 1000;
        a.orbitDistance = a.position.z;
        Data.CAMERA.reset();
        Data.CAMERA.alpha = 1;
        Data.CAMERA.orbitFriction = 1.42;
        Data.CAMERA.minPolarAngle = Math.PI / 2 - 0.2;
        Data.CAMERA.maxPolarAngle = Math.PI / 2 + 0.2;
        Data.CAMERA.target(d);
        Data.CAMERA.sync()
    })();
    this.cameraA = function() {
        Data.CAMERA.target(d)
    };
    this.cameraB = function() {
        Data.CAMERA.target(c)
    };
    this.cameraC = function() {
        Data.CAMERA.tweenTarget(a, 3000, "easeInOutQuad")
    }
});
Class(function FirstToReachShot(e) {
    Inherit(this, TimeController);
    var h = this;
    var g, b;
    var d = 0;
    var f = new THREE.Vector3();
    (function() {
        c();
        Render.startRender(a)
    })();

    function c() {
        g = h.initClass(Camera);
        g.applyState(e.camera1);
        g.forceFOV(45);
        Data.CAMERA.orbitFriction = 2;
        Data.CAMERA.alpha = 1;
        Data.CAMERA.minPolarAngle = Utils.toRadians(1);
        Data.CAMERA.maxPolarAngle = Utils.toRadians(179);
        Data.CAMERA.minTheta = Utils.toRadians(-90);
        Data.CAMERA.maxTheta = Utils.toRadians(90);
        f.copy(g.position);
        Data.CAMERA.target(g);
        g.orbitDistance = g.position.length();
        window.camera = g
    }

    function a() {
        d += 0.007;
        if (g) {
            g.position.z = f.z + Math.sin(d) * (Math.cos(d) * 200)
        }
    }
    this.end = function() {
        Data.CAMERA.orbitFriction = 0.8;
        Render.stopRender(a);
        Data.SHOTS.remove(h)
    };
    this.pause = function() {
        Render.stopRender(a);
        return this._pause()
    };
    this.resume = function() {
        Render.startRender(a);
        return this._resume()
    };
    this.destroy = function() {
        Render.stopRender(a);
        if (this._destroy) {
            this._destroy()
        }
    }
});
Class(function ChangingTimesShot(b) {
    Inherit(this, TimeController);
    var h = this;
    var a, c, k;
    var g = h.initClass(DynamicObject, {
        v: 0
    });
    var f = 0;
    var j = Global.INIT_MOMENT.strpos("changing-times") || Global.CHAPTER_SEEK;
    (function() {
        n();
        l()
    })();

    function d() {
        var o = h.initClass(Camera, Global.ELEMENTS.satellite.mesh);
        o.applyState(b.camera2);
        o.forceFOV(45);
        Data.CAMERA.pivot(true);
        o.initControls(THREE.OrbitControls);
        window.camera = o
    }

    function m() {
        if (!Global.PREVIEW) {
            return
        }
        a = h.initClass(Camera);
        a.applyState(b.camera1);
        a.fov = 60;
        Data.CAMERA.alpha = 1;
        Data.CAMERA.sync();
        Data.CAMERA.pivot(true);
        Data.CAMERA.target(a)
    }

    function n() {
        c = h.initClass(Camera, Global.ELEMENTS.satellite.mesh);
        c.applyState(b.camera2);
        c.fov = 45;
        c.offsetX(-0.18);
        Data.CAMERA.alpha = 0.02;
        Data.CAMERA.sync();
        Data.CAMERA.pivot(true);
        if (j) {
            Data.CAMERA.target(c)
        }
        Data.CAMERA.sync();
        c.orbitDistance = c.position.length()
    }

    function l() {
        k = h.initClass(Camera, Global.ELEMENTS.satellite.mesh);
        k.applyState(b.camera3);
        k.fov = 45;
        k.offsetX(-0.3);
        k.orbitDistance = k.position.length()
    }

    function i() {
        Data.CAMERA.resetTween(5000, "easeInOutCubic");
        Data.CAMERA.alpha = 0.02;
        Data.CAMERA.tweenTarget(c, 4000, "easeInOutCubic", 0, null, function() {
            Data.CAMERA.pivot(true);
            Data.CAMERA.minPolarAngle = Utils.toRadians(80);
            Data.CAMERA.maxPolarAngle = Utils.toRadians(100);
            Data.CAMERA.minTheta = Utils.toRadians(-3);
            Data.CAMERA.maxTheta = Utils.toRadians(3);
            h.tween(g.tween({
                v: 0.05
            }, 5000, "easeOutSine"))
        })
    }

    function e(o) {
        Data.CAMERA.alpha = 0.1 + Math.sin(f) * g.v;
        f += 0.002
    }
    this.cutToFar = function() {
        Data.CAMERA.tweenTarget(k, 3000, "easeInOutCubic")
    };
    this.animateIn = function() {
        if (!j) {
            i()
        }
    };
    this.destroy = function() {
        Render.stopRender(e);
        return this._destroy()
    }
});
Class(function PhoneCordOrbitShot(b) {
    Inherit(this, TimeController);
    var e = this;
    var d, c, a;
    (function() {
        d = e.initClass(Camera);
        d.applyState(b.camera1);
        d.orbitDistance = d.position.z;
        c = e.initClass(Camera);
        c.applyState(b.camera2);
        c.orbitDistance = c.position.z;
        a = e.initClass(Camera);
        a.applyState(b.camera3);
        a.orbitDistance = 3000;
        Data.CAMERA.target(d);
        Data.CAMERA.alpha = 1;
        Data.CAMERA.sync();
        Data.CAMERA.orbitFriction = 2;
        Data.CAMERA.minPolarAngle = Utils.toRadians(0);
        Data.CAMERA.maxPolarAngle = Utils.toRadians(180);
        Data.CAMERA.minTheta = Utils.toRadians(-60);
        Data.CAMERA.maxTheta = Utils.toRadians(60);
        Data.CAMERA.pivot(true)
    })();
    this.zoomIn1 = function() {
        Data.CAMERA.tweenTarget(c, 3000 * Global.MOMENT.PhoneCordOrbitMoment.SPEED_UP, "easeInOutQuad")
    };
    this.zoomIn2 = function() {
        Data.CAMERA.tweenTarget(a, 3000 * Global.MOMENT.PhoneCordOrbitMoment.SPEED_UP, "easeInOutQuad");
        Data.CAMERA.orbitFriction = 1
    };
    this.zoomOut = function() {
        Data.CAMERA.tweenTarget(d, 5000 * Global.MOMENT.PhoneCordOrbitMoment.SPEED_UP, "easeInOutQuart", 0, null, Tooltips.instance().animateIn);
        Data.CAMERA.orbitFriction = 1
    };
    this.destroy = function() {
        Data.CAMERA.reset();
        return e._destroy()
    }
});
Class(function AttemptAtContactShot(b) {
    Inherit(this, TimeController);
    var g = this;
    var i, a, d;
    var k;
    (function() {
        h();
        l();
        c()
    })();

    function e() {
        a = g.initClass(Camera);
        a.applyState(b.camera3);
        a.forceFOV(45);
        Data.CAMERA.pivot(false);
        Data.CAMERA.target(a);
        a.initControls(THREE.OrbitControls);
        window.camera = a
    }

    function h() {
        i = g.initClass(Camera);
        i.applyState(b.camera1);
        i.forceFOV(45);
        Data.CAMERA.pivot(true);
        Data.CAMERA.alpha = 1;
        Data.CAMERA.sync();
        Data.CAMERA.target(i);
        Data.CAMERA.reset();
        Data.CAMERA.orbitFriction = 0.8;
        Data.CAMERA.minPolarAngle = Utils.toRadians(80);
        Data.CAMERA.maxPolarAngle = Utils.toRadians(100);
        Data.CAMERA.minTheta = Utils.toRadians(-5);
        Data.CAMERA.maxTheta = Utils.toRadians(5);
        i.orbitDistance = 1000
    }

    function l() {
        d = g.initClass(Camera);
        d.applyState(b.camera2);
        d.forceFOV(45);
        d.orbitDistance = 3000
    }

    function c() {
        var m = [{
            x: 1113,
            y: -226,
            z: -53,
            w: 150,
            h: 150,
            d: 150,
            name: "satellite"
        }, {
            x: 1220,
            y: 0,
            z: -1650,
            w: 1500,
            h: 1500,
            d: 1500,
            name: "aricebo"
        }];
        k = g.initClass(InteractiveElements, m);
        k.events.add(HydraEvents.HOVER, f);
        k.events.add(HydraEvents.CLICK, j);
        k.detectHit = function(n) {
            if (n.length > 1) {
                return n[1].object
            }
            return n[0].object
        }
    }

    function j(m) {
        Tooltips.instance().hoverIn(4, m.name)
    }

    function f(m) {
        if (m.type == "over") {
            Tooltips.instance().hoverIn(4, m.name)
        } else {
            Tooltips.instance().hoverOut()
        }
    }
    this.transition = function() {
        Global.INTERACTIVE_MOMENT = true;
        if (d) {
            Global.MOMENT.AttemptAtContact.changeRadius()
        }
        if (d) {
            Data.CAMERA.tweenTarget(d, 5000, "easeInOutCubic", 0, null, function() {
                Data.CAMERA.orbitFriction = 1.2;
                k.addListeners();
                Data.CAMERA.minPolarAngle = Utils.toRadians(40);
                Data.CAMERA.maxPolarAngle = Utils.toRadians(140);
                Data.CAMERA.minTheta = Utils.toRadians(-40);
                Data.CAMERA.maxTheta = Utils.toRadians(40)
            })
        }
    };
    this.preview = function() {
        Data.CAMERA.target(d)
    };
    this.destroy = function() {
        Global.INTERACTIVE_MOMENT = false;
        return this._destroy()
    }
});
Class(function ContactShot(c) {
    Inherit(this, TimeController);
    var e = this;
    var d;
    (function() {
        b()
    })();

    function a() {
        var f = e.initClass(Camera);
        f.forceFOV(45);
        f.applyState(c.camera1);
        Data.CAMERA.pivot(false);
        f.initControls(THREE.OrbitControls);
        window.camera = f
    }

    function b() {
        d = e.initClass(Camera);
        d.forceFOV(45);
        d.applyState(c.camera1);
        d.orbitDistance = 500;
        Data.CAMERA.orbitFriction = 0.8;
        Data.CAMERA.minPolarAngle = Utils.toRadians(50);
        Data.CAMERA.maxPolarAngle = Utils.toRadians(130);
        Data.CAMERA.minTheta = Utils.toRadians(-40);
        Data.CAMERA.maxTheta = Utils.toRadians(20);
        Data.CAMERA.alpha = 1;
        Data.CAMERA.pivot(true);
        Data.CAMERA.target(d);
        Data.CAMERA.reset()
    }
});
Class(function TodayShot(e) {
    Inherit(this, TimeController);
    var g = this;
    var d;
    var c = Global.INIT_MOMENT.strpos("today") || Global.CHAPTER_SEEK;
    (function() {
        f();
        if (!c) {
            g.delayedCall(b, 100)
        } else {
            Data.CAMERA.reset()
        }
    })();

    function a() {
        var h = g.initClass(Camera, Global.ELEMENTS.satellite.mesh);
        h.applyState(e.camera1);
        h.forceFOV(45);
        h.offsetX(0.15);
        Data.CAMERA.pivot(false);
        Data.CAMERA.target(h);
        h.initControls(THREE.OrbitControls);
        window.camera = h
    }

    function f() {
        d = g.initClass(Camera);
        d.applyState(e.camera1);
        d.offsetX(0.15);
        Data.CAMERA.orbitFriction = 0.4;
        Data.CAMERA.minPolarAngle = Utils.toRadians(80);
        Data.CAMERA.maxPolarAngle = Utils.toRadians(100);
        Data.CAMERA.minTheta = Utils.toRadians(-50);
        Data.CAMERA.maxTheta = Utils.toRadians(50);
        Data.CAMERA.alpha = 0.2;
        Data.CAMERA.sync();
        if (c) {
            Data.CAMERA.reset();
            Data.CAMERA.target(d)
        }
    }

    function b() {
        Data.CAMERA.tweenTarget(d, 5000, "easeInOutCubic", 0, null, function() {
            Global.ELEMENTS.earth.specular(-1000, -1000, -1000)
        })
    }
});
Class(function InteractiveElements(k, e) {
    Inherit(this, Component);
    var i = this;
    var h = {
        cursor: "auto"
    };
    var g;
    var j = [];
    var b = new THREE.MeshNormalMaterial({
        wireframe: true
    });
    if (!e) {
        b.visible = false
    }
    var l = new THREE.Vector3(0, 0, 1);
    var p = new THREE.Raycaster();
    var a = new THREE.Projector();
    (function() {
        c()
    })();

    function c() {
        for (var r = 0; r < k.length; r++) {
            var t = k[r];
            var q = t.geom || new THREE.BoxGeometry(t.w, t.h, t.d);
            var s = new THREE.Mesh(q, b);
            s.position.set(t.x, t.y, t.z);
            s.name = t.name;
            if (t.rx) {
                s.rotation.x = Utils.toRadians(t.rx)
            }
            if (t.ry) {
                s.rotation.y = Utils.toRadians(t.ry)
            }
            if (t.rz) {
                s.rotation.z = Utils.toRadians(t.rz)
            }
            j.push(s);
            Global.ELEMENTS.scene.add(s)
        }
    }

    function o(t, q) {
        var w = t.x;
        var v = t.y - Global.GL.y;
        l.x = (w / Stage.width) * 2 - 1;
        l.y = -(v / Data.VIDEO.height) * 2 + 1;
        l.z = 1;
        a.unprojectVector(l, Data.CAMERA.orbitCamera);
        p.set(Data.CAMERA.worldCamera.position, l.sub(Data.CAMERA.worldCamera.position).normalize());
        var r = p.ray.origin.clone();
        var s = p.ray.origin.clone().add(p.ray.direction.clone().multiplyScalar(20000));
        if (q) {
            var u = new THREE.Geometry();
            u.vertices.push(r);
            u.vertices.push(s);
            console.log(p);
            var x = new THREE.LineBasicMaterial({
                color: 16711680
            });
            var y = new THREE.Line(u, x);
            Global.ELEMENTS.scene.add(y)
        }
        return p.intersectObjects(j)
    }

    function f(q) {
        var r = null;
        if (!q.length) {
            return null
        }
        if (i.detectHit) {
            r = i.detectHit(q)
        } else {
            r = q[0].object
        }
        return r
    }

    function d(r) {
        var q = o(r);
        if (!q.length) {
            return g = null
        }
        var s = f(q);
        g = s
    }

    function n(r) {
        var q = o(r);
        if (!q.length) {
            return Tooltips.instance().hoverOut()
        }
        var s = f(q);
        if (s == g) {
            i.events.fire(HydraEvents.CLICK, {
                name: s.name
            })
        }
        g = null
    }

    function m(r) {
        var q = o(r);
        var s = f(q);
        if (!q.length) {
            if (h.cursor == "pointer") {
                h.cursor = "auto";
                Stage.div.className = "cursor_move"
            }
        } else {
            if (h.cursor == "auto") {
                h.cursor = "pointer";
                Stage.div.className = "cursor_hover"
            }
        }
    }
    this.addListeners = function() {
        __window.bind("touchstart", d);
        __window.bind("touchend", n);
        __window.bind("touchcancel", n);
        if (!Device.mobile) {
            __window.bind("touchmove", m)
        }
    };
    this.removeListeners = function() {
        __window.unbind("touchstart", d);
        __window.unbind("touchend", n);
        __window.unbind("touchcancel", n);
        __window.unbind("touchmove", m)
    };
    this.destroy = function() {
        this.removeListeners();
        for (var q = 0; q < j.length; q++) {
            Global.ELEMENTS.scene.remove(j[q])
        }
        return this._destroy()
    }
});
Class(function LiveShot() {
    Inherit(this, Component);
    var h = this;
    var g = [],
        e = [],
        a, c, b = false,
        f = new THREE.Vector3(0, 0, 0);
    (function() {
        a = g[0] = h.initClass(Camera);
        g[0].position.z = 1000;
        g[0].orbitDistance = g[0].position.length();
        g[0].live = true;
        g[0].offsetX = 0;
        g[0].offsetY = 0;
        g[1] = h.initClass(Camera, Global.ELEMENTS.satelliteSmall.mesh);
        g[1].position.copy({
            x: -7.249065600918948,
            y: -11.034407263777238,
            z: 4.556632078274497
        });
        g[1].orbitDistance = g[1].position.length() * 0.2;
        g[1].reference.lookAt(f);
        g[1].live = true;
        g[2] = h.initClass(Camera, Global.ELEMENTS.satelliteSmall.mesh);
        g[2].position.z = 20;
        g[2].orbitDistance = g[2].position.length() * 0.2;
        g[2].reference.lookAt(f);
        g[2].live = true;
        g[3] = h.initClass(Camera, Global.ELEMENTS.satelliteSmall.mesh);
        g[3].position.copy({
            x: 2.951373622638065,
            y: -6.947294563324386,
            z: -8.511046350435933
        });
        g[3].orbitDistance = g[3].position.length() * 0.2;
        g[3].reference.lookAt(f);
        g[3].live = true;
        window.cc = g[1];
        d(0, true);
        d(1, false);
        d(2, false);
        d(3, false);
        Data.CAMERA.orbitFriction = 0.2;
        Data.CAMERA.pivot(true);
        Data.CAMERA.alpha = 0.1;
        Data.CAMERA.reset();
        Data.CAMERA.sync();
        Data.CAMERA.target(a);
        Data.CAMERA.setPlanes(1, 80000);
        h.delayedCall(function() {
            Data.CAMERA.target(a);
            Data.CAMERA.tweenTarget(a, 2000, "easeOutCubic", null, function() {
                b = false
            });
            if (Global.MOMENT.LiveMoment) {
                Global.MOMENT.LiveMoment.satelliteSmall()
            }
        }, 500)
    })();
    this.camera = function(l) {
        if (b || c == g[l]) {
            return
        }
        c = g[l];
        b = true;
        for (var k = 0; k < g.length; k++) {
            e[k].enabled = false;
            if (k != l) {
                e[k].reset()
            }
        }
        Data.CAMERA.tweenTarget(g[l], 3000, "easeInOutCubic", null, function() {
            b = false;
            e[l].enabled = true
        });
        if (l == 0) {
            Global.MOMENT.LiveMoment.satelliteSmall()
        } else {
            Global.MOMENT.LiveMoment.satelliteBig()
        }
    };
    this.resume = function() {
        Data.CAMERA.reset();
        Data.CAMERA.resetPlanes()
    };

    function d(k, j) {
        e[k] = new THREE.OrbitControls(g[k].reference);
        e[k].enabled = j
    }
});
Class(function OverviewShot(c) {
    Inherit(this, TimeController);
    var g = this;
    var e, d;
    var b = window.location.href.strpos("preview");
    (function() {
        a()
    })();

    function a() {
        e = g.initClass(Camera);
        e.applyState(c.camera1);
        e.position.multiplyScalar(1.6);
        e.orbitDistance = e.position.length();
        e.fov = 45;
        Data.CAMERA.alpha = 0.000002;
        Data.CAMERA.sync();
        Data.CAMERA.resetPlanes();
        g.tween(TweenManager.tween(Data.CAMERA, {
            alpha: 0.02
        }, 3000, "easeInOutCubic"));
        e.offsetX(0.2);
        e.offsetY(0.01);
        d = g.initClass(Camera, Global.ELEMENTS.satellite.mesh);
        window.camera = d;
        if (Global.CHAPTER_SEEK) {
            Data.CAMERA.reset()
        }
        if (Device.mobile) {
            d.offsetX(-0.22);
            d.offsetY(-0.1);
            d.applyState(c.camera3)
        } else {
            d.offsetX(0.22);
            d.offsetY(0.05);
            d.applyState(c.camera2)
        }
        d.orbitDistance = d.position.length();
        d.forceFOV(45);
        Data.CAMERA.alpha = 0.0002;
        Data.CAMERA.target(d);
        Data.CAMERA.sync();
        if (b) {
            g.delayedCall(f, 200)
        }
        Data.CAMERA.orbitFriction = 1.3
    }

    function f() {
        Data.CAMERA.tweenTarget(e.reference, 5000, "easeInOutQuart", 0, null, function() {});
        Data.CAMERA.orbitFriction = 1.3
    }
    this.destroy = function() {
        this.pause();
        this.stopTweens();
        return this._destroy()
    };
    this.overview = function() {
        f()
    }
});
Class(function TimelineDate(b) {
    Inherit(this, View);
    var h = this;
    var k, a, l, j, n, m, q, f;
    (function() {
        e();
        c();
        o();
        d();
        i()
    })();

    function e() {
        k = h.element;
        k.size(100, 90)
    }

    function c() {
        a = k.create(".copy");
        a.fontStyle("Tungsten", 22, "#fff");
        a.css({
            width: "100%",
            left: 14,
            letterSpacing: 2,
            opacity: 0.2,
            top: 8,
            whiteSpace: "nowrap"
        });
        a.text(b.text);
        m = k.create(".title");
        m.css({
            width: "100%",
            top: 29,
            left: 14
        });
        l = m.create(".copy");
        l.fontStyle("Tungsten", 22, "#fff");
        l.css({
            width: "100%",
            letterSpacing: 2,
            opacity: 0,
            whiteSpace: "nowrap"
        });
        l.text(b.title.toUpperCase())
    }

    function o() {
        j = k.create(".diamond");
        j.size(14, 14).bg(Config.IMAGES + "timeline/node.png").css({
            right: 10,
            top: 13,
            opacity: 0,
            borderRadius: 15
        })
    }

    function d() {
        n = k.create(".line");
        n.size(1, 90).css({
            borderLeft: "1px solid #fff",
            opacity: 0.1
        }).transform({
            y: 70
        });
        q = k.create(".wrap");
        q.size("100%");
        f = q.create(".line");
        f.size(1, 90).css({
            borderLeft: "1px solid #fff",
            opacity: 0.8
        }).transform({
            y: 70
        })
    }

    function i() {
        k.interact(g, p);
        k.hit.css({
            cursor: "default"
        })
    }

    function g(r) {
        if (Global.CHAPTER_SEEK || (Global.CHAPTER_OVERVIEW && b.index == 0) || h.active || !h.visible) {
            return
        }
        h.events.fire(HydraEvents.HOVER, {
            action: r.action,
            index: b.index
        });
        switch (r.action) {
            case "over":
                k.hit.css({
                    cursor: "pointer"
                });
                j.stopTween().tween({
                    opacity: 1
                }, 200, "easeOutSine");
                f.stopTween().tween({
                    y: 0
                }, 200, "easeOutCubic");
                l.stopTween().transform({
                    y: 7
                }).css({
                    opacity: 0
                }).tween({
                    y: 0,
                    opacity: 1
                }, 400, "easeOutCubic");
                a.stopTween().tween({
                    opacity: 1
                }, 100, "easeOutSine");
                break;
            case "out":
                k.hit.css({
                    cursor: "default"
                });
                j.stopTween().tween({
                    opacity: 0.15
                }, 200, "easeOutSine");
                f.stopTween().tween({
                    y: 60
                }, 400, "easeOutCubic");
                l.stopTween().tween({
                    y: 3,
                    opacity: 0
                }, 300, "easeInSine");
                a.stopTween().tween({
                    opacity: 0.7
                }, 200, "easeOutSine");
                break
        }
    }

    function p() {
        if (Global.CHAPTER_SEEK || (Global.CHAPTER_OVERVIEW && b.index == 0)) {
            return
        }
        h.events.fire(ContactEvents.TIMELINE_SEEK, b);
        h.events.fire(HydraEvents.CLICK, b)
    }
    this.activate = function() {
        a.stopTween().tween({
            opacity: 1
        }, 100, "easeOutSine");
        g({
            action: "over"
        });
        h.active = true
    };
    this.deactivate = function() {
        h.active = false;
        j.stopTween().tween({
            opacity: 0.15
        }, 200, "easeOutSine");
        f.stopTween().tween({
            y: 60
        }, 400, "easeOutCubic");
        l.stopTween().tween({
            y: 3,
            opacity: 0
        }, 300, "easeInSine");
        a.stopTween().tween({
            opacity: 0.7
        }, 200, "easeOutSine")
    };
    this.animateIn = function() {
        h.visible = true;
        if (h.active) {
            f.tween({
                y: 0
            }, 700, "easeInOutCubic")
        }
        a.stopTween().tween({
            opacity: h.active ? 1 : 0.7
        }, 200, "easeOutSine");
        n.stopTween().tween({
            y: 0
        }, 500, "easeInOutCubic");
        l.stopTween().tween({
            y: h.active ? 0 : 3,
            opacity: h.active ? 1 : 0
        }, 400, "easeOutCubic");
        j.stopTween().transform({
            y: 10
        }).css({
            opacity: 0
        }).tween({
            y: 0,
            opacity: h.active ? 1 : 0.15
        }, 500, "easeOutCubic", function() {
            k.hit.mouseEnabled(true)
        })
    };
    this.animateOut = function() {
        h.visible = false;
        f.stopTween().tween({
            y: 70
        }, 200, "easeOutCubic");
        n.stopTween().tween({
            y: 70
        }, 400, "easeOutCubic");
        k.hit.mouseEnabled(false);
        l.stopTween().tween({
            y: 3,
            opacity: 0
        }, 300, "easeInSine");
        a.stopTween().tween({
            opacity: h.active ? 1 : 0.3
        }, 300, "easeOutSine");
        j.stopTween().tween({
            y: 10,
            opacity: 0
        }, 300, "easeInSine")
    };
    this.hoverTitleOut = function() {
        m.stopTween().tween({
            opacity: 0
        }, 100, "easeOutSine");
        q.stopTween().tween({
            opacity: 0
        }, 100, "easeOutSine")
    };
    this.hoverTitleIn = function() {
        m.stopTween().tween({
            opacity: 1
        }, 300, "easeOutSine");
        q.stopTween().tween({
            opacity: 1
        }, 300, "easeOutSine")
    }
});
Class(function TimelineDates(b) {
    Inherit(this, View);
    var g = this;
    var j;
    var c, i;
    (function() {
        d();
        k();
        h()
    })();

    function d() {
        j = g.element;
        j.size("100%")
    }

    function k() {
        var n = 0;
        c = [];
        for (var m = 0; m < b.length; m++) {
            b[m].index = m;
            var l = g.initClass(TimelineDate, b[m]);
            l.css({
                left: 2 + n * 98 + "%",
                bottom: -28,
                width: b[m].perc * 98 + "%"
            });
            l.perc = n;
            l.transform({
                y: 50
            });
            c.push(l);
            n += b[m].perc
        }
    }

    function h() {
        g.events.subscribe(ContactEvents.RESIZE, f);
        for (var l = 0; l < c.length; l++) {
            c[l].events.add(HydraEvents.CLICK, e);
            c[l].events.add(HydraEvents.HOVER, a)
        }
    }

    function a(m) {
        if (Stage.width > 1300) {
            return
        }
        clearTimeout(i);
        if (m.action == "over") {
            for (var l = 0; l < c.length; l++) {
                if (m.index !== l) {
                    c[l].hoverTitleOut()
                } else {
                    c[l].hoverTitleIn()
                }
            }
        } else {
            f()
        }
    }

    function f() {
        clearTimeout(i);
        i = setTimeout(function() {
            for (var l = 0; l < c.length; l++) {
                c[l].hoverTitleIn()
            }
        }, 200)
    }

    function e(m) {
        for (var l = 0; l < c[l].length; l++) {
            if (c[l].active) {
                c[l].deactivate()
            }
        }
        g.events.fire(HydraEvents.CLICK, m)
    }
    this.activate = function(l) {
        if (!c[l].active) {
            c[l].activate()
        }
    };
    this.deactivate = function(l) {
        if (c[l].active) {
            c[l].deactivate()
        }
    };
    this.animateIn = function() {
        for (var m = 0; m < c.length; m++) {
            var n = Device.mobile ? 500 : 500;
            var l = Device.mobile ? 0 : 300 * c[m].perc;
            var o = Device.mobile ? "easeInOutCubic" : "timelineBounce";
            c[m].tween({
                y: -15
            }, n, o, l);
            g.delayedCall(c[m].animateIn, l)
        }
    };
    this.animateOut = function(p) {
        for (var m = 0; m < c.length; m++) {
            var n = Device.mobile ? 500 : p ? 800 : 500;
            var l = Device.mobile ? 0 : 300 * c[m].perc;
            var o = Device.mobile ? "easeInOutCubic" : "timelineBounce";
            c[m].tween({
                y: 0
            }, n, o, l);
            g.delayedCall(c[m].animateOut, l)
        }
    }
});
Class(function TimelineGradient(n, s) {
    Inherit(this, View);
    var p = this;
    var d;
    var l, a, c, e, f, b, r;
    p.height = 112;
    (function() {
        j();
        g();
        q();
        h();
        i()
    })();

    function j() {
        d = p.element;
        d.size(Stage.width, p.height).css({
            bottom: 0,
            overflow: "hidden"
        })
    }

    function g() {
        l = p.initClass(Canvas, Stage.width, p.height)
    }

    function h() {
        a = p.initClass(CanvasGraphics, Stage.width, p.height);
        l.add(a);
        a.lineWidth = 4;
        a.y = 2;
        a.alpha = s ? 1 : 0.5
    }

    function q() {
        c = p.initClass(CanvasGraphics, Stage.width, p.height);
        c.fillStyle = "#000";
        c.alpha = 0.92;
        c.y = 20;
        l.add(c);
        e = p.initClass(CanvasGraphics, Stage.width, p.height);
        e.alpha = 0.22;
        e.y = 20;
        l.add(e)
    }

    function i() {
        b = [];
        for (var w = 0; w < 30; w++) {
            var v = new Vector2();
            v.y = 120;
            b.push(v)
        }
    }

    function m() {
        var B = l.context.createLinearGradient(0, 0, Stage.width, 0);
        var A = 0;
        for (var z = 0; z < n.length; z++) {
            var y = n[z];
            for (var x = 0; x < y.colors.length; x++) {
                var w = y.colors[x];
                if (w !== "#000") {
                    var C = 0.02 + y.perc * 0.98;
                    var v = C / y.colors.length;
                    var D = x == 0 ? A : A + v * x;
                    B.addColorStop(D, w)
                }
            }
            A += n[z].perc
        }
        a.strokeStyle = B;
        e.fillStyle = B
    }

    function o(v, y) {
        y = y || 1;
        v.clear();
        v.beginPath();
        v.moveTo(b[0].x, b[0].y * y);
        for (var w = 1; w < b.length - 2; w++) {
            var x = (b[w].x + b[w + 1].x) / 2;
            var z = (b[w].y + b[w + 1].y) / 2;
            v.quadraticCurveTo(b[w].x, b[w].y * y, x, z * y)
        }
        v.quadraticCurveTo(b[w].x, b[w].y * y, b[w + 1].x, b[w + 1].y * y)
    }

    function k(v, w) {
        o(v, w);
        v.stroke();
        v.closePath()
    }

    function u(v) {
        o(v);
        v.lineTo(Stage.width, p.height - 17);
        v.lineTo(0, p.height - 17);
        v.lineTo(b[0].x, b[0].y);
        v.fill();
        v.closePath()
    }

    function t() {
        if (!s) {
            u(c);
            u(e)
        }
        k(a);
        l.render()
    }
    this.resize = function() {
        d.size(Stage.width, p.height);
        l.size(Stage.width, 100);
        var w = Stage.width / (b.length - 1);
        for (var v = 0; v < b.length; v++) {
            b[v].x = w * v
        }
        m();
        t()
    };
    this.animateIn = function() {
        p.visible = true;
        Render.startRender(t);
        for (var v = 0; v < b.length; v++) {
            TweenManager.tween(b[v], {
                y: 30
            }, 400, "timelineBounce", v * 11)
        }
        p.delayedCall(function() {
            if (p.visible) {
                Render.stopRender(t)
            }
        }, b.length * 11 + 500)
    };
    this.animateOut = function(w) {
        p.visible = false;
        Render.startRender(t);
        if (w) {
            TweenManager.tween(c, {
                y: 0
            }, 800, "easeOutSine");
            TweenManager.tween(e, {
                y: 0
            }, 800, "easeOutSine");
            TweenManager.tween(f, {
                y: 0
            }, 800, "easeOutSine")
        }
        for (var v = 0; v < b.length; v++) {
            TweenManager.tween(b[v], {
                y: 90
            }, w ? 800 : 400, "timelineBounce", v * 11)
        }
        p.delayedCall(function() {
            if (!p.visible) {
                Render.stopRender(t)
            }
        }, w ? 1000 : b.length * 11 + 500)
    };
    this.destroy = function() {
        Render.stopRender(t);
        return p._destroy()
    }
});
Class(function TimelineGradientSimple(a, c) {
    Inherit(this, View);
    var e = this;
    var f, b, g;
    (function() {
        d();
        i()
    })();

    function d() {
        f = e.element;
        f.size("100%", 4).css({
            bottom: Mobile.phone ? 0 : 18
        });
        if (c) {
            f.css({
                overflow: "hidden"
            })
        }
        f.wrapper = f.create(".wrapper");
        f.wrapper.size("100%");
        b = f.wrapper.create(".gradient");
        b.size(Stage.width, 4);
        b.cover = b.create(".cover");
        b.cover.size("100%").bg("#000").css({
            opacity: 0.5
        });
        e.cover = b.cover;
        if (!c && !Mobile.phone) {
            var j = f.create(".black");
            j.size("100%", 60).css({
                top: 4
            }).bg("#000").css({
                opacity: 0.92
            });
            g = f.create(".overlay");
            g.size("100%", 60).css({
                top: 4
            }).css({
                opacity: 0.22
            })
        }
    }

    function i() {
        var r = "linear-gradient(90deg";
        var o = 0;
        for (var n = 0; n < a.length; n++) {
            var p = a[n];
            for (var m = 0; m < p.colors.length; m++) {
                var l = p.colors[m];
                if (l !== "#000") {
                    var q = p.perc / p.colors.length;
                    var k = m == 0 ? o : o + q * m;
                    r = r + ", " + l + " " + k * 100 + "%"
                }
            }
            o += a[n].perc
        }
        r += ")";
        b.div.style.background = r;
        if (g) {
            g.div.style.background = r
        }
    }

    function h() {
        var k = 0;
        for (var j = 0; j < a.length; j++) {
            var l = f.create(".copy");
            l.fontStyle("Tungsten", 14, "#fff");
            l.css({
                width: "100%",
                left: 2 + k * 90 + "%",
                letterSpacing: 1,
                opacity: 0.4,
                top: -16,
                whiteSpace: "nowrap"
            });
            l.text(a[j].text);
            k += a[j].perc
        }
    }
    this.update = function() {};
    this.resize = function() {
        b.size(Stage.width, 4)
    };
    this.animateIn = function() {
        f.tween({
            y: -60
        }, 500, "easeInOutCubic")
    };
    this.animateOut = function() {
        f.tween({
            y: -0
        }, 500, "easeInOutCubic")
    }
});
Class(function TimelineNode(c) {
    Inherit(this, View);
    var f = this;
    var i, b;
    var j;
    (function() {
        d();
        h();
        a();
        g()
    })();

    function d() {
        i = f.element;
        i.size(20, 20).css({
            opacity: 0
        }).transform({
            x: 15
        })
    }

    function h() {
        b = i.create(".circle");
        b.size(11, 11).bg("#fff").center().transform({
            rotation: 45,
            scale: 0.8
        });
        b.front = b.create(".front");
        b.front.size("100%").bg("#fff").css({
            opacity: 0.4
        })
    }

    function a() {
        j = f.initClass(TimelineNodeTooltip, c)
    }

    function g() {
        i.interact(e, k);
        i.hit.mouseEnabled(true)
    }

    function e(l) {
        switch (l.action) {
            case "over":
                j.animateIn();
                b.tween({
                    scale: 1
                }, 100, "easeOutCubic");
                b.front.tween({
                    opacity: 1
                }, 100, "easeOutSine");
                break;
            case "out":
                j.animateOut();
                b.tween({
                    scale: 0.8
                }, 100, "easeOutCubic");
                b.front.tween({
                    opacity: 0.4
                }, 200, "easeOutSine");
                break
        }
    }

    function k() {
        f.events.fire(ContactEvents.TIMELINE_SEEK, c)
    }
    this.animateIn = function() {
        i.tween({
            x: 0,
            opacity: 1
        }, 600, "easeOutCubic")
    };
    this.reset = function() {
        i.css({
            opacity: 0
        }).transform({
            x: 15
        })
    }
});
Class(function TimelineNodes(c) {
    Inherit(this, View);
    var f = this;
    var e;
    var d;
    (function() {
        b();
        a()
    })();

    function b() {
        e = f.element;
        e.size("100%").invisible()
    }

    function a() {
        d = [];
        var m = 0;
        for (var k = 0; k < c.length; k++) {
            var n = c[k].nodes;
            if (n && n.length) {
                for (var g = 0; g < n.length; g++) {
                    var l = f.initClass(TimelineNode, n[g]);
                    var h = Mobile.phone ? 20 * k + n[g].perc / 20 : m + (n[g].perc * c[k].perc);
                    var o = h * 100 + "%";
                    l.css({
                        left: o,
                        top: 0,
                        marginTop: -15
                    });
                    l.perc = h;
                    d.push(l)
                }
            }
            m += c[k].perc
        }
    }
    this.animateIn = function() {
        e.visible().clearTransform().clearAlpha();
        if (d) {
            for (var h = 0; h < d.length; h++) {
                var g = d[h].perc * 400 + 300;
                f.delayedCall(d[h].animateIn, g)
            }
        }
    };
    this.animateOut = function() {
        e.tween({
            y: 10,
            opacity: 0
        }, 300, "easeOutCubic", function() {
            e.invisible();
            if (d) {
                for (var g = 0; g < d.length; g++) {
                    d[g].reset()
                }
            }
        })
    }
});
Class(function TimelineNodeTooltip(a) {
    Inherit(this, View);
    var h = this;
    var i, c, m, e;
    var l, k;
    h.width = 178;
    h.height = 50;
    (function() {
        g();
        f();
        j();
        d()
    })();

    function g() {
        i = h.element;
        i.size(h.width, h.height).css({
            top: -70,
            left: -17
        }).invisible()
    }

    function f() {
        c = i.create(".bg");
        c.size("100%").bg("#e5e5e5")
    }

    function j() {
        m = i.create(".arrow");
        m.size(14, 14).css({
            bottom: -5,
            left: 21
        }).transform({
            rotation: 45
        }).bg("#e5e5e5")
    }

    function b() {
        e = i.create(".bg");
        e.size("100%", 4).bg(a.color)
    }

    function d() {
        k = i.create(".text");
        k.fontStyle(Config.FONTS.primary, 24, "#444");
        k.css({
            left: 15,
            top: 9,
            textTransform: "uppercase"
        });
        k.text("NODE HEADING")
    }
    this.animateIn = function() {
        i.visible().transform({
            y: -8
        }).css({
            opacity: 0
        }).tween({
            y: 0,
            opacity: 1
        }, 500, "easeOutCubic")
    };
    this.animateOut = function() {
        i.tween({
            y: -5,
            opacity: 0
        }, 200, "easeOutSine", function() {
            i.invisible()
        })
    }
});
Class(function TimelineView() {
    Inherit(this, View);
    var p = this;
    var d, g;
    var c, h, r;
    var l = Data.TIMELINE.getData();
    var e = new Vector2();
    var o = new Vector2();
    var n = -1;
    (function() {
        j();
        if (!Mobile.phone) {
            a()
        }
        v();
        if (!Mobile.phone) {
            u()
        }
        m();
        q()
    })();

    function j() {
        d = p.element;
        d.perc = 0;
        d.size("100%").css({
            overflow: "hidden"
        }).invisible()
    }

    function a() {
        g = d.create(".shadow");
        g.size("100%", 362).css({
            bottom: 4,
            opacity: 0
        }).bg(Config.IMAGES + "timeline/shadow.png")
    }

    function v() {
        if (Device.mobile) {
            c = p.initClass(TimelineGradientSimple, l)
        } else {
            c = p.initClass(TimelineGradient, l);
            h = p.initClass(TimelineGradient, l, true);
            h.element.css({
                width: 0
            });
            h.width = 0
        }
    }

    function u() {
        r = p.initClass(TimelineDates, l)
    }

    function b() {
        p.disabled = true;
        p.delayedCall(function() {
            p.disabled = false
        }, 800)
    }

    function i() {
        if (Global.WRAPPER_UP) {
            return
        }
        b();
        p.opened = Global.TIMELINE_OPEN = true;
        c.animateIn();
        if (h) {
            h.animateIn()
        }
        if (r) {
            r.animateIn()
        }
    }

    function k() {
        b();
        p.opened = Global.TIMELINE_OPEN = false;
        c.animateOut();
        if (h) {
            h.animateOut()
        }
        if (r) {
            r.animateOut()
        }
    }

    function f(z) {
        var y = 0;
        var B = z * Config.DURATION || 0;
        for (var x = l.length - 1; x > -1; x--) {
            var A = l[x];
            if (B >= A.time_code) {
                var w = (B - A.time_code) / A.duration;
                y = A.start + w * A.perc;
                if (y > 0 && y < 1) {
                    y = y * 0.98 + 0.02
                }
                return {
                    active: x,
                    perc: y
                }
            }
        }
        return {
            active: -1,
            perc: 0
        }
    }

    function t() {
        var y = f(Global.COMPLETION);
        o.x = y.perc;
        e.lerp(o, 0.1);
        if (r && n !== Global.CURRENT_CHAPTER_INDEX && !p.disabled) {
            if (n > -1) {
                r.deactivate(n)
            }
            n = Global.CURRENT_CHAPTER_INDEX;
            if (n > -1) {
                r.activate(n)
            }
        }
        var w = e.x * Stage.width;
        if (h) {
            w = Math.round(w);
            if (h.width !== w || w == 0) {
                h.width = w;
                h.element.div.style.width = h.width + "px"
            }
        } else {
            c.cover.x = w;
            c.cover.transform()
        }
    }

    function m() {
        p.events.subscribe(ContactEvents.RESIZE, q);
        if (r) {
            r.events.add(HydraEvents.CLICK, s)
        }
    }

    function q() {
        c.resize();
        if (h) {
            h.resize()
        }
    }

    function s() {
        p.disabled = true;
        p.delayedCall(function() {
            p.disabled = false
        }, 500);
        if (n > -1) {
            r.deactivate(n)
        }
    }
    this.animateIn = function() {
        Render.startRender(t);
        d.visible();
        if (r) {
            r.animateOut(true)
        }
        c.animateOut(true);
        if (h) {
            h.animateOut(true)
        }
        if (g) {
            g.tween({
                opacity: 1
            }, 800, "easeOutSine", 200)
        }
    };
    this.up = function() {
        i()
    };
    this.down = function() {
        k()
    };
    this.destroy = function() {
        Render.stopRender(t);
        return p._destroy()
    }
});
Class(function TooltipsView() {
    Inherit(this, View);
    var g = this;
    var i, e, l;
    var a, k;
    (function() {
        c();
        j();
        d()
    })();

    function c() {
        i = g.element;
        i.css({
            height: "40%",
            width: 400,
            bottom: 0,
            left: 50
        })
    }

    function j() {
        e = i.create(".title");
        e.fontStyle("GravurCondensed", 26, "#fff");
        e.css({
            bottom: 0,
            letterSpacing: "0.08em"
        })
    }

    function d() {
        l = i.create(".copy");
        l.fontStyle("GravurCondensed", 18, "#fff");
        l.css({
            bottom: 0,
            lineHeight: "1.3em"
        })
    }

    function h() {
        g.visible = true;
        e.html(a.heading.toUpperCase());
        l.html(a.copy);
        Render.nextFrame(function() {
            b();
            e.stopTween().css({
                opacity: 0
            }).transform({
                y: 15
            }).tween({
                y: 0,
                opacity: 1
            }, 500, "easeOutCubic", 100);
            l.stopTween().css({
                opacity: 0
            }).transform({
                y: 15
            }).tween({
                y: 0,
                opacity: 1
            }, 500, "easeOutCubic", 200)
        })
    }

    function f(m) {
        g.visible = false;
        e.stopTween().tween({
            y: 10,
            opacity: 0
        }, 400, "easeInSine", 100, m);
        l.stopTween().tween({
            y: 10,
            opacity: 0
        }, 400, "easeInSine")
    }

    function b() {
        l.css({
            bottom: k + 50
        });
        l.height = l.div.offsetHeight || 100;
        e.css({
            bottom: k + 58 + l.height
        })
    }
    this.animateIn = function(m) {
        a = m;
        if (g.visible) {
            f(h)
        } else {
            h()
        }
    };
    this.animateOut = function() {
        f()
    };
    this.resize = function(m) {
        k = m;
        b()
    }
});
Class(function Main() {
    Inherit(this, Component);
    var d = this;
    var c, b;
    (function() {
        Mouse.capture();
        if (Mobile.os == "Android") {
            Mobile.allowScroll = true
        }
        if (window.location.href.strpos("local") || window.location.href.strpos("10.0.1")) {
            Global.LOCAL = true;
            Hydra.development(true)
        }
        j();
        i()
    })();

    function i() {
        var k = b.getState().split("/")[0];
        if (k == "live") {
            Global.LIVE_LOAD = true
        }
        if (Device.mobile) {
            Device.openFullscreen()
        }
        c = new Loader();
        c.events.add(HydraEvents.COMPLETE, e);
        GATracker.trackPage("/landing_page")
    }

    function e() {
        if (Global.LOADED) {
            return
        }
        Global.LOADED = true;
        Sound.init();
        ContactUtil.checkResize();
        Data.init();
        Container.instance();
        a()
    }

    function j() {
        b = new StateDispatcher(Global.LOCAL);
        Global.INIT_STATE = b.getState();
        Global.STATE_MODEL = b
    }

    function a() {
        if (Device.browser.chrome || Mobile.browser == "Chrome") {
            g()
        } else {
            if (Mobile.os == "iOS" || ContactDevice.WEBGL || Device.browser.safari || Device.browser.firefox || !Device.mobile) {
                DeviceError.instance().show("webgl", g)
            } else {
                DeviceError.instance().show("chrome", g)
            }
        }
    }

    function g() {
        if (Device.mobile) {
            if (Stage.width < Stage.height) {
                DeviceError.instance().show("rotate", h)
            } else {
                h()
            }
        } else {
            h()
        }
    }

    function h() {
        __body.div.scrollTop = Stage.div.scrollTop = __window.div.scrollTop = 0;
        if (Device.mobile) {
            Device.openFullscreen()
        }
        var k = b.getState().split("/");
        var o = k[0];
        Global.INNER_DEEPLINK = k[1];
        Global.CURRENT_CHAPTER_INDEX = 0;
        if (o == "journey") {
            o = "a-new-orbit"
        }
        var m = ["live", "about", "data", "a-new-orbit", "comet-chaser", "changing-times", "contact", "a-new-era"];
        var l = m.indexOf(o) > -1;
        if (l && !Device.mobile) {
            GATracker.trackPage(o);
            d.delayedCall(function() {
                d.events.fire(ContactEvents.BEGIN, {
                    pause: true
                })
            }, 500);
            if (o == "live" || o == "about" || o == "data") {
                Global.NOT_ON_JOURNEY = true;
                Global.FULL_PEEL = true;
                c.animateOut(f);
                d.delayedCall(function() {
                    d.events.fire(ContactEvents.NAV_CLICK, {
                        type: o
                    })
                }, 2500)
            } else {
                switch (o) {
                    case "a-new-orbit":
                        Global.CURRENT_CHAPTER_INDEX = 0;
                        break;
                    case "comet-chaser":
                        Global.CURRENT_CHAPTER_INDEX = 1;
                        break;
                    case "changing-times":
                        Global.CURRENT_CHAPTER_INDEX = 2;
                        break;
                    case "contact":
                        Global.CURRENT_CHAPTER_INDEX = 3;
                        break;
                    case "a-new-era":
                        Global.CURRENT_CHAPTER_INDEX = 4;
                        break
                }
                c.animateOut(f);
                var n = Data.TIMELINE.getFromPerma(o);
                d.delayedCall(function() {
                    d.events.fire(ContactEvents.TIMELINE_SEEK, n)
                }, 2000)
            }
        } else {
            Global.STATE_MODEL.replaceState("");
            GATracker.trackPage("/");
            if (c) {
                c.animateOut(f)
            } else {
                f()
            }
        }
    }

    function f() {
        Container.instance().animateIn();
        setTimeout(function() {
            if (c) {
                c = c.destroy()
            }
        }, 500)
    }
});
