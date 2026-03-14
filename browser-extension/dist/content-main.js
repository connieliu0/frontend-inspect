"use strict";
(() => {
  // node_modules/bippy/dist/rdt-hook.js
  var e = `0.5.32`;
  var t = `bippy-${e}`;
  var n = Object.defineProperty;
  var r = Object.prototype.hasOwnProperty;
  var i = () => {
  };
  var a = (e2) => {
    try {
      Function.prototype.toString.call(e2).indexOf(`^_^`) > -1 && setTimeout(() => {
        throw Error(`React is running in production mode, but dead code elimination has not been applied. Read how to correctly configure React for production: https://reactjs.org/link/perf-use-production-build`);
      });
    } catch {
    }
  };
  var o = (e2 = globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__) => !!(e2 && `getFiberRoots` in e2);
  var s = false;
  var c;
  var l = (e2 = globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__) => s ? true : (e2 && typeof e2.inject == `function` && (c = e2.inject.toString()), !!c?.includes(`(injected)`));
  var u = /* @__PURE__ */ new Set();
  var d = /* @__PURE__ */ new Set();
  var f = (e2) => {
    let r2 = /* @__PURE__ */ new Map(), o2 = 0, s2 = { _instrumentationIsActive: false, _instrumentationSource: t, checkDCE: a, hasUnsupportedRendererAttached: false, inject(e3) {
      let t2 = ++o2;
      return r2.set(t2, e3), d.add(e3), s2._instrumentationIsActive || (s2._instrumentationIsActive = true, u.forEach((e4) => e4())), t2;
    }, on: i, onCommitFiberRoot: i, onCommitFiberUnmount: i, onPostCommitFiberRoot: i, renderers: r2, supportsFiber: true, supportsFlight: true };
    try {
      n(globalThis, `__REACT_DEVTOOLS_GLOBAL_HOOK__`, { configurable: true, enumerable: true, get() {
        return s2;
      }, set(t3) {
        if (t3 && typeof t3 == `object`) {
          let n2 = s2.renderers;
          s2 = t3, n2.size > 0 && (n2.forEach((e3, n3) => {
            d.add(e3), t3.renderers.set(n3, e3);
          }), p(e2));
        }
      } });
      let t2 = window.hasOwnProperty, r3 = false;
      n(window, `hasOwnProperty`, { configurable: true, value: function(...e3) {
        try {
          if (!r3 && e3[0] === `__REACT_DEVTOOLS_GLOBAL_HOOK__`) return globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__ = void 0, r3 = true, -0;
        } catch {
        }
        return t2.apply(this, e3);
      }, writable: true });
    } catch {
      p(e2);
    }
    return s2;
  };
  var p = (e2) => {
    e2 && u.add(e2);
    try {
      let n2 = globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__;
      if (!n2) return;
      if (!n2._instrumentationSource) {
        n2.checkDCE = a, n2.supportsFiber = true, n2.supportsFlight = true, n2.hasUnsupportedRendererAttached = false, n2._instrumentationSource = t, n2._instrumentationIsActive = false;
        let e3 = o(n2);
        if (e3 || (n2.on = i), n2.renderers.size) {
          n2._instrumentationIsActive = true, u.forEach((e4) => e4());
          return;
        }
        let r2 = n2.inject, c2 = l(n2);
        c2 && !e3 && (s = true, n2.inject({ scheduleRefresh() {
        } }) && (n2._instrumentationIsActive = true)), n2.inject = (e4) => {
          let t2 = r2(e4);
          return d.add(e4), c2 && n2.renderers.set(t2, e4), n2._instrumentationIsActive = true, u.forEach((e5) => e5()), t2;
        };
      }
      (n2.renderers.size || n2._instrumentationIsActive || l()) && e2?.();
    } catch {
    }
  };
  var m = () => r.call(globalThis, `__REACT_DEVTOOLS_GLOBAL_HOOK__`);
  var h = (e2) => m() ? (p(e2), globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__) : f(e2);
  var g = () => !!(typeof window < `u` && (window.document?.createElement || window.navigator?.product === `ReactNative`));
  var _ = () => {
    try {
      g() && h();
    } catch {
    }
  };

  // node_modules/bippy/dist/install-hook-only.js
  _();

  // node_modules/bippy/dist/core.js
  var d2 = 0;
  var ee = 1;
  var ne = 5;
  var oe = 11;
  var f2 = 13;
  var m2 = 15;
  var h2 = 16;
  var se = 19;
  var ue = 26;
  var de = 27;
  var fe = 28;
  var pe = 30;
  var ge = (e2) => {
    switch (e2.tag) {
      case 1:
      case 11:
      case 0:
      case 14:
      case 15:
        return true;
      default:
        return false;
    }
  };
  function j(e2, t2, n2 = false) {
    if (!e2) return null;
    let r2 = t2(e2);
    if (r2 instanceof Promise) return (async () => {
      if (await r2 === true) return e2;
      let i3 = n2 ? e2.return : e2.child;
      for (; i3; ) {
        let e3 = await N(i3, t2, n2);
        if (e3) return e3;
        i3 = n2 ? null : i3.sibling;
      }
      return null;
    })();
    if (r2 === true) return e2;
    let i2 = n2 ? e2.return : e2.child;
    for (; i2; ) {
      let e3 = M(i2, t2, n2);
      if (e3) return e3;
      i2 = n2 ? null : i2.sibling;
    }
    return null;
  }
  var M = (e2, t2, n2 = false) => {
    if (!e2) return null;
    if (t2(e2) === true) return e2;
    let r2 = n2 ? e2.return : e2.child;
    for (; r2; ) {
      let e3 = M(r2, t2, n2);
      if (e3) return e3;
      r2 = n2 ? null : r2.sibling;
    }
    return null;
  };
  var N = async (e2, t2, n2 = false) => {
    if (!e2) return null;
    if (await t2(e2) === true) return e2;
    let r2 = n2 ? e2.return : e2.child;
    for (; r2; ) {
      let e3 = await N(r2, t2, n2);
      if (e3) return e3;
      r2 = n2 ? null : r2.sibling;
    }
    return null;
  };
  var P = (e2) => {
    let t2 = e2;
    return typeof t2 == `function` ? t2 : typeof t2 == `object` && t2 ? P(t2.type || t2.render) : null;
  };
  var we = (e2) => {
    let t2 = e2;
    if (typeof t2 == `string`) return t2;
    if (typeof t2 != `function` && !(typeof t2 == `object` && t2)) return null;
    let n2 = t2.displayName || t2.name || null;
    if (n2) return n2;
    let r2 = P(t2);
    return r2 && (r2.displayName || r2.name) || null;
  };
  var Te = () => {
    let e2 = globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    return !!e2?._instrumentationIsActive || o(e2) || l(e2);
  };
  var Z = (e2) => {
    let t2 = globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (t2?.renderers) for (let n2 of t2.renderers.values()) try {
      let t3 = n2.findFiberByHostInstance?.(e2);
      if (t3) return t3;
    } catch {
    }
    if (typeof e2 == `object` && e2) {
      if (`_reactRootContainer` in e2) return e2._reactRootContainer?._internalRoot?.current?.child;
      for (let t3 in e2) if (t3.startsWith(`__reactContainer$`) || t3.startsWith(`__reactInternalInstance$`) || t3.startsWith(`__reactFiber`)) return e2[t3] || null;
    }
    return null;
  };
  var Q = Error();

  // node_modules/bippy/dist/source.js
  var h3 = /^[a-zA-Z][a-zA-Z\d+\-.]*:/;
  var te2 = [`rsc://`, `file:///`, `webpack://`, `webpack-internal://`, `node:`, `turbopack://`, `metro://`, `/app-pages-browser/`, `/(app-pages-browser)/`];
  var ne2 = [`<anonymous>`, `eval`, ``];
  var g3 = /\.(jsx|tsx|ts|js)$/;
  var re2 = /(\.min|bundle|chunk|vendor|vendors|runtime|polyfill|polyfills)\.(js|mjs|cjs)$|(chunk|bundle|vendor|vendors|runtime|polyfill|polyfills|framework|app|main|index)[-_.][A-Za-z0-9_-]{4,}\.(js|mjs|cjs)$|[\da-f]{8,}\.(js|mjs|cjs)$|[-_.][\da-f]{20,}\.(js|mjs|cjs)$|\/dist\/|\/build\/|\/.next\/|\/out\/|\/node_modules\/|\.webpack\.|\.vite\.|\.turbopack\./i;
  var ie2 = /^\?[\w~.-]+(?:=[^&#]*)?(?:&[\w~.-]+(?:=[^&#]*)?)*$/;
  var _3 = `(at Server)`;
  var v2 = /(^|@)\S+:\d+/;
  var y2 = /^\s*at .*(\S+:\d+|\(native\))/m;
  var ae2 = /^(eval@)?(\[native code\])?$/;
  var x2 = (e2, t2) => {
    if (t2?.includeInElement !== false) {
      let n2 = e2.split(`
`), r2 = [];
      for (let e3 of n2) if (/^\s*at\s+/.test(e3)) {
        let t3 = w2(e3, void 0)[0];
        t3 && r2.push(t3);
      } else if (/^\s*in\s+/.test(e3)) {
        let t3 = e3.replace(/^\s*in\s+/, ``).replace(/\s*\(at .*\)$/, ``);
        r2.push({ functionName: t3, source: e3 });
      } else if (e3.match(v2)) {
        let t3 = T2(e3, void 0)[0];
        t3 && r2.push(t3);
      }
      return C2(r2, t2);
    }
    return e2.match(y2) ? w2(e2, t2) : T2(e2, t2);
  };
  var S = (e2) => {
    if (!e2.includes(`:`)) return [e2, void 0, void 0];
    let t2 = e2.startsWith(`(`) && /:\d+\)$/.test(e2) ? e2.slice(1, -1) : e2, n2 = /(.+?)(?::(\d+))?(?::(\d+))?$/.exec(t2);
    return n2 ? [n2[1], n2[2] || void 0, n2[3] || void 0] : [t2, void 0, void 0];
  };
  var C2 = (e2, t2) => t2 && t2.slice != null ? Array.isArray(t2.slice) ? e2.slice(t2.slice[0], t2.slice[1]) : e2.slice(0, t2.slice) : e2;
  var w2 = (e2, t2) => C2(e2.split(`
`).filter((e3) => !!e3.match(y2)), t2).map((e3) => {
    let t3 = e3;
    t3.includes(`(eval `) && (t3 = t3.replace(/eval code/g, `eval`).replace(/(\(eval at [^()]*)|(,.*$)/g, ``));
    let n2 = t3.replace(/^\s+/, ``).replace(/\(eval code/g, `(`).replace(/^.*?\s+/, ``), r2 = n2.match(/ (\(.+\)$)/);
    n2 = r2 ? n2.replace(r2[0], ``) : n2;
    let i2 = S(r2 ? r2[1] : n2);
    return { functionName: r2 && n2 || void 0, fileName: [`eval`, `<anonymous>`].includes(i2[0]) ? void 0 : i2[0], lineNumber: i2[1] ? +i2[1] : void 0, columnNumber: i2[2] ? +i2[2] : void 0, source: t3 };
  });
  var T2 = (e2, t2) => C2(e2.split(`
`).filter((e3) => !e3.match(ae2)), t2).map((e3) => {
    let t3 = e3;
    if (t3.includes(` > eval`) && (t3 = t3.replace(/ line (\d+)(?: > eval line \d+)* > eval:\d+:\d+/g, `:$1`)), !t3.includes(`@`) && !t3.includes(`:`)) return { functionName: t3 };
    {
      let e4 = /(([^\n\r"\u2028\u2029]*".[^\n\r"\u2028\u2029]*"[^\n\r@\u2028\u2029]*(?:@[^\n\r"\u2028\u2029]*"[^\n\r@\u2028\u2029]*)*(?:[\n\r\u2028\u2029][^@]*)?)?[^@]*)@/, n2 = t3.match(e4), r2 = n2 && n2[1] ? n2[1] : void 0, i2 = S(t3.replace(e4, ``));
      return { functionName: r2, fileName: i2[0], lineNumber: i2[1] ? +i2[1] : void 0, columnNumber: i2[2] ? +i2[2] : void 0, source: t3 };
    }
  });
  var le2 = 44;
  var k2 = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/`;
  var ue2 = new Uint8Array(64);
  var A2 = new Uint8Array(128);
  for (let e2 = 0; e2 < k2.length; e2++) {
    let t2 = k2.charCodeAt(e2);
    ue2[e2] = t2, A2[t2] = e2;
  }
  function j2(e2, t2) {
    let n2 = 0, r2 = 0, i2 = 0;
    do
      i2 = A2[e2.next()], n2 |= (i2 & 31) << r2, r2 += 5;
    while (i2 & 32);
    let a2 = n2 & 1;
    return n2 >>>= 1, a2 && (n2 = -2147483648 | -n2), t2 + n2;
  }
  function M2(e2, t2) {
    return e2.pos >= t2 ? false : e2.peek() !== le2;
  }
  var de2 = class {
    constructor(e2) {
      this.pos = 0, this.buffer = e2;
    }
    next() {
      return this.buffer.charCodeAt(this.pos++);
    }
    peek() {
      return this.buffer.charCodeAt(this.pos);
    }
    indexOf(e2) {
      let { buffer: t2, pos: n2 } = this, r2 = t2.indexOf(e2, n2);
      return r2 === -1 ? t2.length : r2;
    }
  };
  function N2(e2) {
    let { length: t2 } = e2, n2 = new de2(e2), r2 = [], i2 = 0, a2 = 0, o2 = 0, s2 = 0, c2 = 0;
    do {
      let e3 = n2.indexOf(`;`), t3 = [], l2 = true, u2 = 0;
      for (i2 = 0; n2.pos < e3; ) {
        let r3;
        i2 = j2(n2, i2), i2 < u2 && (l2 = false), u2 = i2, M2(n2, e3) ? (a2 = j2(n2, a2), o2 = j2(n2, o2), s2 = j2(n2, s2), M2(n2, e3) ? (c2 = j2(n2, c2), r3 = [i2, a2, o2, s2, c2]) : r3 = [i2, a2, o2, s2]) : r3 = [i2], t3.push(r3), n2.pos++;
      }
      l2 || fe2(t3), r2.push(t3), n2.pos = e3 + 1;
    } while (n2.pos <= t2);
    return r2;
  }
  function fe2(e2) {
    e2.sort(pe2);
  }
  function pe2(e2, t2) {
    return e2[0] - t2[0];
  }
  var P2 = /^[a-zA-Z][a-zA-Z\d+\-.]*:/;
  var me2 = /^data:application\/json[^,]+base64,/;
  var he2 = /(?:\/\/[@#][ \t]+sourceMappingURL=([^\s'"]+?)[ \t]*$)|(?:\/\*[@#][ \t]+sourceMappingURL=([^*]+?)[ \t]*(?:\*\/)[ \t]*$)/;
  var F2 = typeof WeakRef < `u`;
  var I = /* @__PURE__ */ new Map();
  var L2 = /* @__PURE__ */ new Map();
  var ge2 = (e2) => F2 && e2 instanceof WeakRef;
  var R2 = (e2, t2, n2, r2) => {
    if (n2 < 0 || n2 >= e2.length) return null;
    let i2 = e2[n2];
    if (!i2 || i2.length === 0) return null;
    let a2 = null;
    for (let e3 of i2) if (e3[0] <= r2) a2 = e3;
    else break;
    if (!a2 || a2.length < 4) return null;
    let [, o2, s2, c2] = a2;
    if (o2 === void 0 || s2 === void 0 || c2 === void 0) return null;
    let l2 = t2[o2];
    return l2 ? { columnNumber: c2, fileName: l2, lineNumber: s2 + 1 } : null;
  };
  var z2 = (e2, t2, n2) => {
    if (e2.sections) {
      let r2 = null;
      for (let i3 of e2.sections) if (t2 > i3.offset.line || t2 === i3.offset.line && n2 >= i3.offset.column) r2 = i3;
      else break;
      if (!r2) return null;
      let i2 = t2 - r2.offset.line, a2 = t2 === r2.offset.line ? n2 - r2.offset.column : n2;
      return R2(r2.map.mappings, r2.map.sources, i2, a2);
    }
    return R2(e2.mappings, e2.sources, t2 - 1, n2);
  };
  var _e2 = (e2, t2) => {
    let n2 = t2.split(`
`), r2;
    for (let e3 = n2.length - 1; e3 >= 0 && !r2; e3--) {
      let t3 = n2[e3].match(he2);
      t3 && (r2 = t3[1] || t3[2]);
    }
    if (!r2) return null;
    let i2 = P2.test(r2);
    if (!(me2.test(r2) || i2 || r2.startsWith(`/`))) {
      let t3 = e2.split(`/`);
      t3[t3.length - 1] = r2, r2 = t3.join(`/`);
    }
    return r2;
  };
  var ve2 = (e2) => ({ file: e2.file, mappings: N2(e2.mappings), names: e2.names, sourceRoot: e2.sourceRoot, sources: e2.sources, sourcesContent: e2.sourcesContent, version: 3 });
  var ye2 = (e2) => {
    let t2 = e2.sections.map(({ map: e3, offset: t3 }) => ({ map: { ...e3, mappings: N2(e3.mappings) }, offset: t3 })), n2 = /* @__PURE__ */ new Set();
    for (let e3 of t2) for (let t3 of e3.map.sources) n2.add(t3);
    return { file: e2.file, mappings: [], names: [], sections: t2, sourceRoot: void 0, sources: Array.from(n2), sourcesContent: void 0, version: 3 };
  };
  var B2 = (e2) => {
    if (!e2) return false;
    let t2 = e2.trim();
    if (!t2) return false;
    let n2 = t2.match(P2);
    if (!n2) return true;
    let r2 = n2[0].toLowerCase();
    return r2 === `http:` || r2 === `https:`;
  };
  var V2 = async (e2, t2 = fetch) => {
    if (!B2(e2)) return null;
    let n2;
    try {
      let r3 = await t2(e2);
      if (!r3.ok) return null;
      n2 = await r3.text();
    } catch {
      return null;
    }
    if (!n2) return null;
    let r2 = _e2(e2, n2);
    if (!r2 || !B2(r2)) return null;
    try {
      let e3 = await t2(r2);
      if (!e3.ok) return null;
      let n3 = await e3.json();
      return `sections` in n3 ? ye2(n3) : ve2(n3);
    } catch {
      return null;
    }
  };
  var H2 = async (e2, t2 = true, n2) => {
    if (t2 && I.has(e2)) {
      let t3 = I.get(e2);
      if (t3 == null) return null;
      if (ge2(t3)) {
        let n3 = t3.deref();
        if (n3) return n3;
        I.delete(e2);
      } else return t3;
    }
    if (t2 && L2.has(e2)) return L2.get(e2);
    let r2 = V2(e2, n2);
    t2 && L2.set(e2, r2);
    let i2 = await r2;
    return t2 && L2.delete(e2), t2 && (i2 === null ? I.set(e2, null) : I.set(e2, F2 ? new WeakRef(i2) : i2)), i2;
  };
  var U2 = async (e2, t2 = true, n2) => await Promise.all(e2.map(async (e3) => {
    if (!e3.fileName) return e3;
    let r2 = await H2(e3.fileName, t2, n2);
    if (!r2 || typeof e3.lineNumber != `number` || typeof e3.columnNumber != `number`) return e3;
    let i2 = z2(r2, e3.lineNumber, e3.columnNumber);
    return i2 ? { ...e3, source: i2.fileName && e3.source ? e3.source.replace(e3.fileName, i2.fileName) : e3.source, fileName: i2.fileName, lineNumber: i2.lineNumber, columnNumber: i2.columnNumber, isSymbolicated: true } : e3;
  }));
  var W = (e2) => e2._debugStack instanceof Error && typeof e2._debugStack?.stack == `string`;
  var be2 = () => {
    let n2 = h();
    for (let t2 of [...Array.from(d), ...Array.from(n2.renderers.values())]) {
      let e2 = t2.currentDispatcherRef;
      if (e2 && typeof e2 == `object`) return `H` in e2 ? e2.H : e2.current;
    }
    return null;
  };
  var G = (t2) => {
    for (let n2 of d) {
      let e2 = n2.currentDispatcherRef;
      e2 && typeof e2 == `object` && (`H` in e2 ? e2.H = t2 : e2.current = t2);
    }
  };
  var K = (e2) => `
    in ${e2}`;
  var q = (e2, t2) => {
    let n2 = K(e2);
    return t2 && (n2 += ` (at ${t2})`), n2;
  };
  var J2 = false;
  var Y = (e2, t2) => {
    if (!e2 || J2) return ``;
    let n2 = Error.prepareStackTrace;
    Error.prepareStackTrace = void 0, J2 = true;
    let r2 = be2();
    G(null);
    let i2 = console.error, a2 = console.warn;
    console.error = () => {
    }, console.warn = () => {
    };
    try {
      let n3 = { DetermineComponentFrameRoot() {
        let n4;
        try {
          if (t2) {
            let t3 = function() {
              throw Error();
            };
            if (Object.defineProperty(t3.prototype, `props`, { set: function() {
              throw Error();
            } }), typeof Reflect == `object` && Reflect.construct) {
              try {
                Reflect.construct(t3, []);
              } catch (e3) {
                n4 = e3;
              }
              Reflect.construct(e2, [], t3);
            } else {
              try {
                t3.call();
              } catch (e3) {
                n4 = e3;
              }
              e2.call(t3.prototype);
            }
          } else {
            try {
              throw Error();
            } catch (e3) {
              n4 = e3;
            }
            let t3 = e2();
            t3 && typeof t3.catch == `function` && t3.catch(() => {
            });
          }
        } catch (e3) {
          if (e3 instanceof Error && n4 instanceof Error && typeof e3.stack == `string`) return [e3.stack, n4.stack];
        }
        return [null, null];
      } };
      n3.DetermineComponentFrameRoot.displayName = `DetermineComponentFrameRoot`, Object.getOwnPropertyDescriptor(n3.DetermineComponentFrameRoot, `name`)?.configurable && Object.defineProperty(n3.DetermineComponentFrameRoot, `name`, { value: `DetermineComponentFrameRoot` });
      let [r3, i3] = n3.DetermineComponentFrameRoot();
      if (r3 && i3) {
        let t3 = r3.split(`
`), n4 = i3.split(`
`), a3 = 0, o3 = 0;
        for (; a3 < t3.length && !t3[a3].includes(`DetermineComponentFrameRoot`); ) a3++;
        for (; o3 < n4.length && !n4[o3].includes(`DetermineComponentFrameRoot`); ) o3++;
        if (a3 === t3.length || o3 === n4.length) for (a3 = t3.length - 1, o3 = n4.length - 1; a3 >= 1 && o3 >= 0 && t3[a3] !== n4[o3]; ) o3--;
        for (; a3 >= 1 && o3 >= 0; a3--, o3--) if (t3[a3] !== n4[o3]) {
          if (a3 !== 1 || o3 !== 1) do
            if (a3--, o3--, o3 < 0 || t3[a3] !== n4[o3]) {
              let n5 = `
${t3[a3].replace(` at new `, ` at `)}`, r4 = we(e2);
              return r4 && n5.includes(`<anonymous>`) && (n5 = n5.replace(`<anonymous>`, r4)), n5;
            }
          while (a3 >= 1 && o3 >= 0);
          break;
        }
      }
    } finally {
      J2 = false, Error.prepareStackTrace = n2, G(r2), console.error = i2, console.warn = a2;
    }
    let o2 = e2 ? we(e2) : ``;
    return o2 ? K(o2) : ``;
  };
  var X = (e2, t2) => {
    let p3 = e2.tag, m3 = ``;
    switch (p3) {
      case fe:
        m3 = K(`Activity`);
        break;
      case ee:
        m3 = Y(e2.type, true);
        break;
      case oe:
        m3 = Y(e2.type.render, false);
        break;
      case d2:
      case m2:
        m3 = Y(e2.type, false);
        break;
      case ne:
      case ue:
      case de:
        m3 = K(e2.type);
        break;
      case h2:
        m3 = K(`Lazy`);
        break;
      case f2:
        m3 = e2.child !== t2 && t2 !== null ? K(`Suspense Fallback`) : K(`Suspense`);
        break;
      case se:
        m3 = K(`SuspenseList`);
        break;
      case pe:
        m3 = K(`ViewTransition`);
        break;
      default:
        return ``;
    }
    return m3;
  };
  var Z2 = (e2) => {
    try {
      let t2 = ``, n2 = e2, r2 = null;
      do {
        t2 += X(n2, r2);
        let e3 = n2._debugInfo;
        if (e3 && Array.isArray(e3)) for (let n3 = e3.length - 1; n3 >= 0; n3--) {
          let r3 = e3[n3];
          typeof r3.name == `string` && (t2 += q(r3.name, r3.env));
        }
        r2 = n2, n2 = n2.return;
      } while (n2);
      return t2;
    } catch (e3) {
      return e3 instanceof Error ? `
Error generating stack: ${e3.message}
${e3.stack}` : ``;
    }
  };
  var xe2 = (e2) => {
    let t2 = Error.prepareStackTrace;
    Error.prepareStackTrace = void 0;
    let n2 = e2;
    if (!n2) return ``;
    Error.prepareStackTrace = t2, n2.startsWith(`Error: react-stack-top-frame
`) && (n2 = n2.slice(29));
    let r2 = n2.indexOf(`
`);
    if (r2 !== -1 && (n2 = n2.slice(r2 + 1)), r2 = Math.max(n2.indexOf(`react_stack_bottom_frame`), n2.indexOf(`react-stack-bottom-frame`)), r2 !== -1 && (r2 = n2.lastIndexOf(`
`, r2)), r2 !== -1) n2 = n2.slice(0, r2);
    else return ``;
    return n2;
  };
  var Se2 = (e2) => !!(e2.fileName?.startsWith(`rsc://`) && e2.functionName);
  var Ce2 = (e2, t2) => e2.fileName === t2.fileName && e2.lineNumber === t2.lineNumber && e2.columnNumber === t2.columnNumber;
  var we2 = (e2) => {
    let t2 = /* @__PURE__ */ new Map();
    for (let n2 of e2) for (let e3 of n2.stackFrames) {
      if (!Se2(e3)) continue;
      let n3 = e3.functionName, r2 = t2.get(n3) ?? [];
      r2.some((t3) => Ce2(t3, e3)) || (r2.push(e3), t2.set(n3, r2));
    }
    return t2;
  };
  var Te2 = (e2, t2, n2) => {
    if (!e2.functionName) return { ...e2, isServer: true };
    let r2 = t2.get(e2.functionName);
    if (!r2 || r2.length === 0) return { ...e2, isServer: true };
    let i2 = n2.get(e2.functionName) ?? 0, a2 = r2[i2 % r2.length];
    return n2.set(e2.functionName, i2 + 1), { ...e2, isServer: true, fileName: a2.fileName, lineNumber: a2.lineNumber, columnNumber: a2.columnNumber, source: e2.source?.replace(_3, `(${a2.fileName}:${a2.lineNumber}:${a2.columnNumber})`) };
  };
  var Ee2 = (e2) => {
    let t2 = [];
    return j(e2, (e3) => {
      if (!W(e3)) return;
      let n2 = typeof e3.type == `string` ? e3.type : we(e3.type) || `<anonymous>`;
      t2.push({ componentName: n2, stackFrames: x2(xe2(e3._debugStack?.stack)) });
    }, true), t2;
  };
  var Q2 = async (e2, t2 = true, n2) => {
    let r2 = Ee2(e2), i2 = x2(Z2(e2)), a2 = we2(r2), o2 = /* @__PURE__ */ new Map();
    return U2(i2.map((e3) => e3.source?.includes(_3) ?? false ? Te2(e3, a2, o2) : e3).filter((e3, t3, n3) => {
      if (t3 === 0) return true;
      let r3 = n3[t3 - 1];
      return e3.functionName !== r3.functionName;
    }), t2, n2);
  };
  var ke2 = (e2) => e2.split(`/`).filter(Boolean).length;
  var Ae2 = (e2) => e2.split(`/`).filter(Boolean)[0] ?? null;
  var je2 = (e2) => {
    let t2 = e2.indexOf(`/`, 1);
    if (t2 === -1 || ke2(e2.slice(0, t2)) !== 1) return e2;
    let n2 = e2.slice(t2);
    if (!g3.test(n2) || ke2(n2) < 2) return e2;
    let r2 = Ae2(n2);
    return !r2 || r2.startsWith(`@`) || r2.length > 4 ? e2 : n2;
  };
  var $2 = (e2) => {
    if (!e2 || ne2.some((t3) => t3 === e2)) return ``;
    let t2 = e2, n2 = t2.startsWith(`http://`) || t2.startsWith(`https://`);
    if (n2) try {
      t2 = new URL(t2).pathname;
    } catch {
    }
    if (n2 && (t2 = je2(t2)), t2.startsWith(`about://React/`)) {
      let e3 = t2.slice(14), n3 = e3.indexOf(`/`), r3 = e3.indexOf(`:`);
      t2 = n3 !== -1 && (r3 === -1 || n3 < r3) ? e3.slice(n3 + 1) : e3;
    }
    let r2 = true;
    for (; r2; ) {
      r2 = false;
      for (let e3 of te2) if (t2.startsWith(e3)) {
        t2 = t2.slice(e3.length), e3 === `file:///` && (t2 = `/${t2.replace(/^\/+/, ``)}`), r2 = true;
        break;
      }
    }
    if (h3.test(t2)) {
      let e3 = t2.match(h3);
      e3 && (t2 = t2.slice(e3[0].length));
    }
    if (t2.startsWith(`//`)) {
      let e3 = t2.indexOf(`/`, 2);
      t2 = e3 === -1 ? `` : t2.slice(e3);
    }
    let i2 = t2.indexOf(`?`);
    if (i2 !== -1) {
      let e3 = t2.slice(i2);
      ie2.test(e3) && (t2 = t2.slice(0, i2));
    }
    return t2;
  };
  var Me2 = (e2) => {
    let t2 = $2(e2);
    return !(!t2 || !g3.test(t2) || re2.test(t2));
  };

  // node_modules/element-source/dist/index.js
  var SYMBOLICATION_TIMEOUT_MS = 5e3;
  var MAX_SOURCE_CONTEXT_WINDOW_CHARS = 4e3;
  var SOURCE_CONTEXT_HALF_WINDOW_CHARS = MAX_SOURCE_CONTEXT_WINDOW_CHARS / 2;
  var SOLID_HANDLER_SOURCE_LENGTH_MIN_CHARS = 3;
  var SVELTE_COLUMN_OFFSET = 1;
  var SOURCE_LINE_START_COLUMN = 1;
  var MIN_COMPONENT_NAME_LENGTH_CHARS = 1;
  var isElement = (node) => typeof Element !== "undefined" && node instanceof Element;
  var NON_COMPONENT_PREFIXES = [
    "_",
    "$",
    "motion.",
    "styled.",
    "chakra.",
    "ark.",
    "Primitive.",
    "Slot."
  ];
  var NEXT_INTERNAL_NAMES = /* @__PURE__ */ new Set([
    "InnerLayoutRouter",
    "RedirectErrorBoundary",
    "RedirectBoundary",
    "HTTPAccessFallbackErrorBoundary",
    "HTTPAccessFallbackBoundary",
    "LoadingBoundary",
    "ErrorBoundary",
    "InnerScrollAndFocusHandler",
    "ScrollAndFocusHandler",
    "RenderFromTemplateContext",
    "OuterLayoutRouter",
    "body",
    "html",
    "DevRootHTTPAccessFallbackBoundary",
    "AppDevOverlayErrorBoundary",
    "AppDevOverlay",
    "HotReload",
    "Router",
    "ErrorBoundaryHandler",
    "AppRouter",
    "ServerRoot",
    "SegmentStateProvider",
    "RootErrorBoundary",
    "LoadableComponent",
    "MotionDOMComponent"
  ]);
  var REACT_INTERNAL_NAMES = /* @__PURE__ */ new Set([
    "Suspense",
    "Fragment",
    "StrictMode",
    "Profiler",
    "SuspenseList"
  ]);
  var cachedIsNextProject;
  var checkIsNextProject = (revalidate) => {
    if (revalidate) {
      cachedIsNextProject = void 0;
    }
    cachedIsNextProject ??= typeof document !== "undefined" && Boolean(document.getElementById("__NEXT_DATA__") || document.querySelector("nextjs-portal"));
    return cachedIsNextProject;
  };
  var isInternalComponentName = (name) => {
    if (NEXT_INTERNAL_NAMES.has(name)) return true;
    if (REACT_INTERNAL_NAMES.has(name)) return true;
    return NON_COMPONENT_PREFIXES.some((prefix) => name.startsWith(prefix));
  };
  var isSourceComponentName = (name) => {
    if (name.length <= MIN_COMPONENT_NAME_LENGTH_CHARS) return false;
    if (isInternalComponentName(name)) return false;
    if (name[0] !== name[0].toUpperCase()) return false;
    if (name.includes("Provider") || name.includes("Context")) return false;
    return true;
  };
  var isUsefulComponentName = (name) => {
    if (!name) return false;
    if (isInternalComponentName(name)) return false;
    if (name === "SlotClone" || name === "Slot") return false;
    return true;
  };
  var SERVER_COMPONENT_URL_PREFIXES = ["about://React/", "rsc://React/"];
  var isServerComponentUrl = (url) => SERVER_COMPONENT_URL_PREFIXES.some((prefix) => url.startsWith(prefix));
  var devirtualizeServerUrl = (url) => {
    for (const prefix of SERVER_COMPONENT_URL_PREFIXES) {
      if (!url.startsWith(prefix)) continue;
      const envEnd = url.indexOf("/", prefix.length);
      const queryStart = url.lastIndexOf("?");
      if (envEnd > -1 && queryStart > -1) {
        return decodeURI(url.slice(envEnd + 1, queryStart));
      }
    }
    return url;
  };
  var symbolicateServerFrames = async (frames) => {
    const serverIndices = [];
    const requestFrames = [];
    for (let index = 0; index < frames.length; index++) {
      const frame = frames[index];
      if (!frame.isServer || !frame.fileName) continue;
      serverIndices.push(index);
      requestFrames.push({
        file: devirtualizeServerUrl(frame.fileName),
        methodName: frame.functionName ?? "<unknown>",
        line1: frame.lineNumber ?? null,
        column1: frame.columnNumber ?? null,
        arguments: []
      });
    }
    if (requestFrames.length === 0) return frames;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), SYMBOLICATION_TIMEOUT_MS);
    try {
      const response = await fetch("/__nextjs_original-stack-frames", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frames: requestFrames,
          isServer: true,
          isEdgeServer: false,
          isAppDirectory: true
        }),
        signal: controller.signal
      });
      if (!response.ok) return frames;
      const results = await response.json();
      const resolved = [...frames];
      for (let index = 0; index < serverIndices.length; index++) {
        const result = results[index];
        if (result?.status !== "fulfilled") continue;
        const original = result.value?.originalStackFrame;
        if (!original?.file || original.ignored) continue;
        const frameIndex = serverIndices[index];
        resolved[frameIndex] = {
          ...frames[frameIndex],
          fileName: original.file,
          lineNumber: original.line1 ?? void 0,
          columnNumber: original.column1 ?? void 0,
          isSymbolicated: true
        };
      }
      return resolved;
    } catch {
      return frames;
    } finally {
      clearTimeout(timeout);
    }
  };
  var extractServerFramesFromDebugStack = (rootFiber) => {
    const serverFramesByName = /* @__PURE__ */ new Map();
    j(
      rootFiber,
      (currentFiber) => {
        if (!W(currentFiber)) return false;
        const ownerStack = xe2(currentFiber._debugStack.stack);
        if (!ownerStack) return false;
        for (const frame of x2(ownerStack)) {
          if (!frame.functionName || !frame.fileName) continue;
          if (!isServerComponentUrl(frame.fileName)) continue;
          if (serverFramesByName.has(frame.functionName)) continue;
          serverFramesByName.set(frame.functionName, { ...frame, isServer: true });
        }
        return false;
      },
      true
    );
    return serverFramesByName;
  };
  var enrichServerFrameLocations = (rootFiber, frames) => {
    const hasUnresolved = frames.some(
      (frame) => frame.isServer && !frame.fileName && frame.functionName
    );
    if (!hasUnresolved) return frames;
    const serverFramesByName = extractServerFramesFromDebugStack(rootFiber);
    if (serverFramesByName.size === 0) return frames;
    return frames.map((frame) => {
      if (!frame.isServer || frame.fileName || !frame.functionName) return frame;
      const resolved = serverFramesByName.get(frame.functionName);
      if (!resolved) return frame;
      return {
        ...frame,
        fileName: resolved.fileName,
        lineNumber: resolved.lineNumber,
        columnNumber: resolved.columnNumber
      };
    });
  };
  var findNearestFiberNode = (node) => {
    if (!Te()) return node;
    if (Z(node)) return node;
    if (isElement(node)) {
      let current = node.parentElement;
      while (current) {
        if (Z(current)) return current;
        current = current.parentElement;
      }
    }
    return node;
  };
  var stackCache = /* @__PURE__ */ new WeakMap();
  var fetchStackForNode = async (node) => {
    try {
      const fiber = Z(node);
      if (!fiber) return null;
      const frames = await Q2(fiber);
      if (checkIsNextProject()) {
        const enriched = enrichServerFrameLocations(fiber, frames);
        return symbolicateServerFrames(enriched);
      }
      return frames;
    } catch {
      return null;
    }
  };
  var getReactStack = (node) => {
    if (!Te()) return Promise.resolve([]);
    const resolved = findNearestFiberNode(node);
    const cached = stackCache.get(resolved);
    if (cached) return cached;
    const promise = fetchStackForNode(resolved);
    stackCache.set(resolved, promise);
    return promise;
  };
  var resolveSourceFromStack = (stack) => {
    if (!stack || stack.length === 0) return null;
    for (const frame of stack) {
      if (frame.fileName && Me2(frame.fileName)) {
        return {
          filePath: $2(frame.fileName),
          lineNumber: frame.lineNumber ?? null,
          columnNumber: null,
          componentName: frame.functionName && isSourceComponentName(frame.functionName) ? frame.functionName : null
        };
      }
    }
    return null;
  };
  var resolveStack = async (node) => {
    const stack = await getReactStack(node);
    const source = resolveSourceFromStack(stack);
    return source ? [source] : [];
  };
  var resolveComponentName = async (node) => {
    if (!Te()) return null;
    const stack = await getReactStack(node);
    if (stack) {
      for (const frame of stack) {
        if (frame.functionName && isSourceComponentName(frame.functionName)) {
          return frame.functionName;
        }
      }
    }
    const resolved = findNearestFiberNode(node);
    const fiber = Z(resolved);
    if (!fiber) return null;
    let current = fiber.return;
    while (current) {
      if (ge(current)) {
        const name = we(current.type);
        if (name && isUsefulComponentName(name)) return name;
      }
      current = current.return;
    }
    return null;
  };
  var reactResolver = {
    name: "react",
    resolveStack,
    resolveComponentName
  };
  var isRecord = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
  var readString = (value) => typeof value === "string" ? value : null;
  var readNumber = (value) => typeof value === "number" && Number.isFinite(value) ? value : null;
  var SVELTE_META_PROPERTY = "__svelte_meta";
  var getNearestSvelteMeta = (element) => {
    let current = element;
    while (current) {
      const meta = Reflect.get(current, SVELTE_META_PROPERTY);
      if (isRecord(meta)) return meta;
      current = current.parentElement;
    }
    return null;
  };
  var readSvelteLocation = (meta) => {
    const location = meta.loc;
    if (!isRecord(location)) return null;
    const filePath = readString(location.file);
    const lineNumber = readNumber(location.line);
    const rawColumn = readNumber(location.column);
    if (!filePath || lineNumber === null || rawColumn === null) return null;
    return {
      filePath,
      lineNumber,
      columnNumber: rawColumn + SVELTE_COLUMN_OFFSET
    };
  };
  var readComponentNameFromParent = (meta) => {
    let current = meta.parent;
    while (isRecord(current)) {
      const tag = readString(current.componentTag);
      if (tag) return tag;
      current = current.parent;
    }
    return null;
  };
  var readParentStackFrames = (meta) => {
    const frames = [];
    let current = meta.parent;
    while (isRecord(current)) {
      const filePath = readString(current.file);
      const lineNumber = readNumber(current.line);
      const rawColumn = readNumber(current.column);
      const componentName = readString(current.componentTag);
      if (filePath && lineNumber !== null && rawColumn !== null) {
        frames.push({
          filePath,
          lineNumber,
          columnNumber: rawColumn + SVELTE_COLUMN_OFFSET,
          componentName
        });
      }
      current = current.parent;
    }
    return frames;
  };
  var resolveStack2 = (element) => {
    const meta = getNearestSvelteMeta(element);
    if (!meta) return [];
    const location = readSvelteLocation(meta);
    if (!location) return [];
    const frames = [
      {
        filePath: location.filePath,
        lineNumber: location.lineNumber,
        columnNumber: location.columnNumber,
        componentName: readComponentNameFromParent(meta)
      }
    ];
    const seen = /* @__PURE__ */ new Set([`${location.filePath}:${location.lineNumber}:${location.columnNumber}`]);
    for (const parentFrame of readParentStackFrames(meta)) {
      const identity = `${parentFrame.filePath}:${parentFrame.lineNumber ?? ""}:${parentFrame.columnNumber ?? ""}`;
      if (seen.has(identity)) continue;
      seen.add(identity);
      frames.push(parentFrame);
    }
    return frames;
  };
  var svelteResolver = {
    name: "svelte",
    resolveStack: resolveStack2
  };
  var SOURCE_DELIMITER = ":";
  var parsePositiveInteger = (value) => {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed < 1) return null;
    return parsed;
  };
  var parseSourceLocation = (location) => {
    const lastDelimiterIndex = location.lastIndexOf(SOURCE_DELIMITER);
    if (lastDelimiterIndex === -1) return null;
    const secondLastDelimiterIndex = location.lastIndexOf(SOURCE_DELIMITER, lastDelimiterIndex - 1);
    if (secondLastDelimiterIndex === -1) return null;
    const filePath = location.slice(0, secondLastDelimiterIndex);
    if (!filePath) return null;
    const lineValue = location.slice(secondLastDelimiterIndex + 1, lastDelimiterIndex);
    const columnValue = location.slice(lastDelimiterIndex + 1);
    const lineNumber = parsePositiveInteger(lineValue);
    const columnNumber = parsePositiveInteger(columnValue);
    if (lineNumber === null || columnNumber === null) return null;
    return { filePath, lineNumber, columnNumber };
  };
  var INSPECTOR_ATTRIBUTE = "data-v-inspector";
  var INSPECTOR_SELECTOR = `[${INSPECTOR_ATTRIBUTE}]`;
  var PARENT_COMPONENT_PROPERTY = "__vueParentComponent";
  var getVueComponentType = (component) => {
    if (!component) return null;
    const componentType = component.type;
    return isRecord(componentType) ? componentType : null;
  };
  var getVueParentComponent = (element) => {
    const component = Reflect.get(element, PARENT_COMPONENT_PROPERTY);
    return isRecord(component) ? component : null;
  };
  var getNearestVueComponent = (element) => {
    let current = element;
    while (current) {
      const component = getVueParentComponent(current);
      if (component) return component;
      current = current.parentElement;
    }
    return null;
  };
  var getComponentName = (componentType) => {
    if (!componentType) return null;
    return readString(componentType.__name) ?? readString(componentType.name);
  };
  var getComponentFilePath = (componentType) => {
    if (!componentType) return null;
    return readString(componentType.__file);
  };
  var getParentComponentFrom = (component) => {
    if (!component) return null;
    const parent = Reflect.get(component, "parent");
    return isRecord(parent) ? parent : null;
  };
  var getComponentChain = (element) => {
    const chain = [];
    let current = getNearestVueComponent(element);
    while (current) {
      chain.push(current);
      current = getParentComponentFrom(current);
    }
    return chain;
  };
  var getRuntimeStackFrames = (element) => getComponentChain(element).map((component) => {
    const componentType = getVueComponentType(component);
    const filePath = getComponentFilePath(componentType);
    if (!filePath) return null;
    return {
      filePath,
      lineNumber: null,
      columnNumber: null,
      componentName: getComponentName(componentType)
    };
  }).filter((frame) => Boolean(frame));
  var resolveFromInspectorAttribute = (element) => {
    const sourceElement = element.closest(INSPECTOR_SELECTOR);
    if (!sourceElement) return null;
    const location = sourceElement.getAttribute(INSPECTOR_ATTRIBUTE);
    if (!location) return null;
    const parsed = parseSourceLocation(location);
    if (!parsed) return null;
    const nearestComponent = getNearestVueComponent(element);
    const componentType = getVueComponentType(nearestComponent);
    return {
      filePath: parsed.filePath,
      lineNumber: parsed.lineNumber,
      columnNumber: parsed.columnNumber,
      componentName: getComponentName(componentType)
    };
  };
  var resolveStack3 = (element) => {
    const frames = [];
    const seen = /* @__PURE__ */ new Set();
    const inspectorInfo = resolveFromInspectorAttribute(element);
    if (inspectorInfo) {
      const identity = `${inspectorInfo.filePath}|${inspectorInfo.componentName ?? ""}`;
      frames.push(inspectorInfo);
      seen.add(identity);
    }
    for (const runtimeFrame of getRuntimeStackFrames(element)) {
      const identity = `${runtimeFrame.filePath}|${runtimeFrame.componentName ?? ""}`;
      if (seen.has(identity)) continue;
      seen.add(identity);
      frames.push(runtimeFrame);
    }
    return frames;
  };
  var vueResolver = {
    name: "vue",
    resolveStack: resolveStack3
  };
  var HANDLER_PREFIX = "$$";
  var SOURCE_LOCATION_PATTERN = /location:\s*["']([^"']+:\d+:\d+)["']/g;
  var SOURCE_MODULE_PATH_PREFIX = "/src/";
  var CSS_FILE_EXTENSION = ".css";
  var IMAGE_IMPORT_SUFFIX = "?import";
  var RUNTIME_MODULES_KEY = "__SOLID_RUNTIME_MODULES__";
  var MODULE_SOURCE_CACHE = /* @__PURE__ */ new Map();
  var HANDLER_STACK_CACHE = /* @__PURE__ */ new Map();
  var shouldIncludeModule = (resourceUrl) => {
    if (resourceUrl.includes(IMAGE_IMPORT_SUFFIX)) return false;
    const pathname = new URL(resourceUrl, window.location.href).pathname;
    if (pathname.endsWith(CSS_FILE_EXTENSION)) return false;
    return pathname.includes(SOURCE_MODULE_PATH_PREFIX);
  };
  var readModuleUrlsFromPerformance = () => {
    if (typeof window === "undefined") return [];
    const entries = performance.getEntriesByType("resource");
    const urls = /* @__PURE__ */ new Set();
    for (const entry of entries) {
      if (!entry.name || !shouldIncludeModule(entry.name)) continue;
      urls.add(entry.name);
    }
    return Array.from(urls);
  };
  var fetchModuleSource = (moduleUrl) => {
    const cached = MODULE_SOURCE_CACHE.get(moduleUrl);
    if (cached) return cached;
    const promise = fetch(moduleUrl).then((response) => response.ok ? response.text() : null).catch(() => null);
    MODULE_SOURCE_CACHE.set(moduleUrl, promise);
    return promise;
  };
  var readRuntimeModules = () => {
    if (typeof window === "undefined") return [];
    const modules = Reflect.get(window, RUNTIME_MODULES_KEY);
    if (!Array.isArray(modules)) return [];
    return modules;
  };
  var findHandlerSourceMatch = async (handlerSource) => {
    for (const runtimeModule of readRuntimeModules()) {
      const index = runtimeModule.content.indexOf(handlerSource);
      if (index === -1) continue;
      return {
        moduleUrl: runtimeModule.url,
        moduleContent: runtimeModule.content,
        handlerSourceIndex: index
      };
    }
    for (const moduleUrl of readModuleUrlsFromPerformance()) {
      const content = await fetchModuleSource(moduleUrl);
      if (!content) continue;
      const index = content.indexOf(handlerSource);
      if (index === -1) continue;
      return {
        moduleUrl,
        moduleContent: content,
        handlerSourceIndex: index
      };
    }
    return null;
  };
  var parseNearbyLocations = (moduleContent, handlerIndex) => {
    const windowStart = Math.max(0, handlerIndex - SOURCE_CONTEXT_HALF_WINDOW_CHARS);
    const windowEnd = Math.min(moduleContent.length, handlerIndex + SOURCE_CONTEXT_HALF_WINDOW_CHARS);
    const windowText = moduleContent.slice(windowStart, windowEnd);
    const matches = [];
    for (const match of windowText.matchAll(SOURCE_LOCATION_PATTERN)) {
      const rawLocation = match[1];
      if (!rawLocation) continue;
      const parsed = parseSourceLocation(rawLocation);
      if (!parsed || match.index === void 0) continue;
      const absoluteIndex = windowStart + match.index;
      matches.push({
        sourceInfo: {
          filePath: parsed.filePath,
          lineNumber: parsed.lineNumber,
          columnNumber: parsed.columnNumber,
          componentName: null
        },
        distance: Math.abs(absoluteIndex - handlerIndex)
      });
    }
    matches.sort((left, right) => {
      const leftLine = left.sourceInfo.lineNumber ?? 0;
      const rightLine = right.sourceInfo.lineNumber ?? 0;
      if (rightLine !== leftLine) return rightLine - leftLine;
      return left.distance - right.distance;
    });
    const seen = /* @__PURE__ */ new Set();
    const unique = [];
    for (const match of matches) {
      const identity = `${match.sourceInfo.filePath}:${match.sourceInfo.lineNumber}:${match.sourceInfo.columnNumber}`;
      if (seen.has(identity)) continue;
      seen.add(identity);
      unique.push(match.sourceInfo);
    }
    return unique;
  };
  var toProjectRelativePath = (moduleUrl) => {
    try {
      const pathname = decodeURIComponent(new URL(moduleUrl, window.location.href).pathname);
      if (!pathname.includes(SOURCE_MODULE_PATH_PREFIX)) return null;
      return pathname.startsWith("/") ? pathname.slice(1) : pathname;
    } catch {
      return null;
    }
  };
  var getGeneratedLocation = (moduleContent, handlerIndex) => {
    const prefix = moduleContent.slice(0, handlerIndex);
    const lines = prefix.split("\n");
    const lastLine = lines[lines.length - 1] ?? "";
    return {
      lineNumber: lines.length,
      columnNumber: lastLine.length + SOURCE_LINE_START_COLUMN
    };
  };
  var findHandlerCandidate = (element) => {
    let current = element;
    while (current) {
      for (const property of Object.getOwnPropertyNames(current)) {
        if (!property.startsWith(HANDLER_PREFIX)) continue;
        const value = Reflect.get(current, property);
        if (typeof value !== "function") continue;
        const source = String(value).trim();
        if (source.length < SOLID_HANDLER_SOURCE_LENGTH_MIN_CHARS) continue;
        return { source };
      }
      current = current.parentElement;
    }
    return null;
  };
  var resolveFromHandler = (handlerSource) => {
    const cached = HANDLER_STACK_CACHE.get(handlerSource);
    if (cached) return cached;
    const promise = (async () => {
      const match = await findHandlerSourceMatch(handlerSource);
      if (!match) return [];
      const locationFrames = parseNearbyLocations(match.moduleContent, match.handlerSourceIndex);
      if (locationFrames.length > 0) return locationFrames;
      const modulePath = toProjectRelativePath(match.moduleUrl);
      if (!modulePath) return [];
      const generated = getGeneratedLocation(match.moduleContent, match.handlerSourceIndex);
      return [
        {
          filePath: modulePath,
          lineNumber: generated.lineNumber,
          columnNumber: generated.columnNumber,
          componentName: null
        }
      ];
    })();
    HANDLER_STACK_CACHE.set(handlerSource, promise);
    return promise;
  };
  var resolveStack4 = (element) => {
    const candidate = findHandlerCandidate(element);
    if (!candidate) return Promise.resolve([]);
    return resolveFromHandler(candidate.source);
  };
  var solidResolver = {
    name: "solid",
    resolveStack: resolveStack4
  };
  var getTagName = (node) => {
    if ("tagName" in node && typeof node.tagName === "string") return node.tagName.toLowerCase();
    if ("nodeName" in node && typeof node.nodeName === "string") return node.nodeName.toLowerCase();
    return "";
  };
  var DEFAULT_RESOLVERS = [svelteResolver, vueResolver, solidResolver];
  var resolveFrameworkStack = async (element, resolvers) => {
    for (const resolver of resolvers) {
      const frames = await resolver.resolveStack(element);
      const validFrames = frames.filter((frame) => frame.filePath.length > 0);
      if (validFrames.length > 0) return validFrames;
    }
    return [];
  };
  var createSourceResolver = (options = {}) => {
    const frameworkResolvers = options.resolvers ?? DEFAULT_RESOLVERS;
    const resolveStack6 = async (node) => {
      const reactStack = await reactResolver.resolveStack(node);
      if (isElement(node)) {
        const frameworkStack = await resolveFrameworkStack(node, frameworkResolvers);
        if (reactStack.length > 0) return [...reactStack, ...frameworkStack];
        return frameworkStack;
      }
      return reactStack;
    };
    const resolveSource2 = async (node) => {
      const stack = await resolveStack6(node);
      return stack[0] ?? null;
    };
    const resolveComponentName3 = async (node) => {
      const reactName = await reactResolver.resolveComponentName?.(node);
      if (reactName) return reactName;
      if (isElement(node)) {
        const frameworkStack = await resolveFrameworkStack(node, frameworkResolvers);
        const frameworkName = frameworkStack.find((frame) => frame.componentName)?.componentName;
        return frameworkName ?? null;
      }
      return null;
    };
    const resolveElementInfo2 = async (node) => {
      const stack = await resolveStack6(node);
      const source = stack[0] ?? null;
      const componentName = stack.find((frame) => frame.componentName)?.componentName ?? await reactResolver.resolveComponentName?.(node) ?? null;
      return {
        tagName: getTagName(node),
        componentName,
        source,
        stack
      };
    };
    return { resolveSource: resolveSource2, resolveStack: resolveStack6, resolveComponentName: resolveComponentName3, resolveElementInfo: resolveElementInfo2 };
  };
  var defaultResolver = createSourceResolver();
  var resolveSource = defaultResolver.resolveSource;
  var resolveStack5 = defaultResolver.resolveStack;
  var resolveComponentName2 = defaultResolver.resolveComponentName;
  var resolveElementInfo = defaultResolver.resolveElementInfo;

  // content-main.js
  var TOGGLE_EVENT = "react-grab-toggle";
  var pickMode = false;
  var lastHovered = null;
  document.addEventListener(TOGGLE_EVENT, (e2) => {
    pickMode = e2.detail?.on ?? !pickMode;
    document.body.style.cursor = pickMode ? "crosshair" : "";
    if (!pickMode && lastHovered) {
      lastHovered.style.outline = "";
      lastHovered = null;
    }
  });
  document.addEventListener("mouseover", (e2) => {
    if (!pickMode) return;
    if (lastHovered) lastHovered.style.outline = "";
    lastHovered = e2.target;
    lastHovered.style.outline = "2px solid blue";
  });
  document.addEventListener("mouseout", (e2) => {
    if (!pickMode) return;
    e2.target.style.outline = "";
  });
  document.addEventListener("click", async (e2) => {
    if (!pickMode) return;
    e2.preventDefault();
    e2.stopPropagation();
    if (lastHovered) lastHovered.style.outline = "";
    pickMode = false;
    document.body.style.cursor = "";
    try {
      const info = await resolveElementInfo(e2.target);
      if (!info?.source) return;
      const rawStack = await getReactStack(e2.target);
      const sourceFrames = (rawStack ?? []).filter((f3) => f3.fileName && Me2(f3.fileName)).map((f3) => ({
        filePath: $2(f3.fileName),
        lineNumber: f3.lineNumber ?? null,
        columnNumber: f3.columnNumber ?? null
      }));
      const best = sourceFrames.length > 0 ? sourceFrames.reduce(
        (a2, b2) => (b2.lineNumber ?? 0) > (a2.lineNumber ?? 0) ? b2 : a2
      ) : info.source;
      const { filePath, lineNumber, columnNumber } = best;
      const line = lineNumber ?? 1;
      const col = columnNumber ?? 1;
      const configEl = document.getElementById("react-grab-config");
      const root = (configEl?.dataset?.projectRoot || "").trim().replace(/\/$/, "");
      if (!root) {
        alert("Set your project path: right-click the React Grab icon \u2192 Options");
        return;
      }
      const fullPath = `${root}/${filePath.replace(/^\//, "")}`;
      const url = `cursor://file/${fullPath}:${line}:${col}`;
      const w3 = window.open(url, "_blank", "noopener,noreferrer");
      if (!w3) window.location.href = url;
    } catch (err) {
    }
  }, true);
})();
/*! Bundled license information:

bippy/dist/rdt-hook.js:
  (**
   * @license bippy
   *
   * Copyright (c) Aiden Bai
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

bippy/dist/install-hook-only.js:
  (**
   * @license bippy
   *
   * Copyright (c) Aiden Bai
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

bippy/dist/core.js:
  (**
   * @license bippy
   *
   * Copyright (c) Aiden Bai
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

bippy/dist/index.js:
  (**
   * @license bippy
   *
   * Copyright (c) Aiden Bai
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

bippy/dist/source.js:
  (**
   * @license bippy
   *
   * Copyright (c) Aiden Bai
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
*/
