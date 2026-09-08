import {
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import tokens from "../specs/design-tokens.json";

/** A non-modal receipt, confined to free space inside the visible product canvas. */
export function ProductFeedback({
  product,
  children,
}: {
  product: RefObject<HTMLDivElement | null>;
  children: ReactNode;
}) {
  const panel = useRef<HTMLElement>(null);
  const [position, setPosition] = useState({
    position: "fixed" as "fixed" | "absolute",
    left: 0,
    top: 0,
    width: 0,
    maxHeight: 0,
  });
  useLayoutEffect(() => {
    const place = () => {
      const canvas = product.current;
      if (!canvas) return;
      const bounds = canvas.getBoundingClientRect();
      const pad = tokens.spacePx[1];
      const inView =
        bounds.bottom > pad && bounds.top < window.innerHeight - pad;
      const top = inView ? Math.max(pad, bounds.top + pad) : bounds.top + pad;
      const bottom = inView
        ? Math.min(window.innerHeight - pad, bounds.bottom - pad)
        : bounds.bottom - pad;
      const blocked = Array.from(
        canvas.querySelectorAll<HTMLElement>("button,a,summary,input,select"),
      )
        .filter((node) => !panel.current?.contains(node))
        .map((node) => node.getBoundingClientRect())
        .filter((r) => r.width && r.height && r.bottom > top && r.top < bottom)
        .sort((a, b) => a.top - b.top);
      let cursor = top;
      const gaps = [];
      for (const r of blocked) {
        if (r.top - pad > cursor)
          gaps.push({ top: cursor, height: r.top - pad - cursor });
        cursor = Math.max(cursor, r.bottom + pad);
      }
      if (bottom > cursor) gaps.push({ top: cursor, height: bottom - cursor });
      const gap = gaps.sort((a, b) => b.height - a.height)[0];
      setPosition({
        position: inView ? "fixed" : "absolute",
        left: inView ? bounds.left + pad : pad,
        width: Math.max(0, bounds.width - pad * 2),
        top: (gap?.top ?? top) - (inView ? 0 : bounds.top),
        maxHeight: Math.max(0, gap?.height ?? 0),
      });
    };
    place();
    const observer = new ResizeObserver(place);
    if (product.current) observer.observe(product.current);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [product, children]);
  return (
    <section
      ref={panel}
      className="product-feedback"
      aria-label="本轮调整结果"
      style={{
        ...position,
        visibility: position.maxHeight > 0 ? "visible" : "hidden",
      }}
    >
      {children}
    </section>
  );
}
