import { describe, expect, it } from "vitest";

import { h } from "./dom.js";
import { morphChildren } from "./morph.js";

const frag = (...nodes) => {
  const f = document.createDocumentFragment();
  f.append(...nodes);
  return f;
};

describe("morphChildren", () => {
  it("같은 요소는 남기고 글자와 속성만 바꿉니다", () => {
    const root = h("div", null, h("button", { class: "a" }, "하나"));
    const button = root.firstChild;
    morphChildren(root, frag(h("button", { class: "b", "aria-pressed": "true" }, "둘")));
    expect(root.firstChild).toBe(button);
    expect(button.className).toBe("b");
    expect(button.getAttribute("aria-pressed")).toBe("true");
    expect(button.textContent).toBe("둘");
  });

  it("키로 짝을 지어 순서를 바꿔도 요소를 유지합니다", () => {
    const root = h("ul", null, h("li", { "data-key": "a" }, "A"), h("li", { "data-key": "b" }, "B"));
    const [a, b] = root.children;
    morphChildren(
      root,
      frag(h("li", { "data-key": "b" }, "B"), h("li", { "data-key": "c" }, "C"), h("li", { "data-key": "a" }, "A")),
    );
    expect([...root.children].map((li) => li.textContent)).toEqual(["B", "C", "A"]);
    expect(root.children[0]).toBe(b);
    expect(root.children[2]).toBe(a);
  });

  it("앞의 항목이 빠져도 뒤 항목은 옮기지 않습니다 (애니메이션이 다시 돌지 않게)", () => {
    const root = h(
      "ul",
      null,
      h("li", { "data-key": "a" }),
      h("li", { "data-key": "b" }),
      h("li", { "data-key": "c" }),
    );
    const [, b, c] = root.children;
    const moved = [];
    const original = root.insertBefore.bind(root);
    root.insertBefore = (node, ref) => {
      moved.push(node);
      return original(node, ref);
    };
    morphChildren(root, frag(h("li", { "data-key": "b" }), h("li", { "data-key": "c" })));
    expect([...root.children]).toEqual([b, c]);
    expect(moved).toEqual([]);
  });

  it("없어진 자식은 지웁니다", () => {
    const root = h("div", null, h("p", null, "1"), h("p", null, "2"));
    morphChildren(root, frag(h("p", null, "1")));
    expect(root.children).toHaveLength(1);
  });

  it("초점이 있는 요소를 지키므로 다시 그려도 초점이 남습니다", () => {
    const root = h("div", null, h("button", null, "끝내기"));
    document.body.append(root);
    root.firstChild.focus();
    morphChildren(root, frag(h("button", { disabled: true }, "끝내기")));
    expect(document.activeElement).toBe(root.firstChild);
    root.remove();
  });
});
