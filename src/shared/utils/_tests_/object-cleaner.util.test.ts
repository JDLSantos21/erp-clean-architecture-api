import { cleanObject } from "../object-cleaner.util";

describe("ObjectCleaner", () => {
  it("Elimina propiedades con valores null o undefined", () => {
    const obj = {
      a: 1,
      b: null,
      c: undefined,
      d: "test",
      e: "",
    };
    const cleaned = cleanObject(obj);
    expect(cleaned).toEqual({ a: 1, d: "test" });
  });
  it("Elimina cadenas vacías y recorta espacios", () => {
    const obj = {
      a: "  hello  ",
      b: "",
      c: "   ",
      d: "world",
    };
    const cleaned = cleanObject(obj);
    expect(cleaned).toEqual({ a: "hello", d: "world" });
  });

  it("No elimina propiedades si las opciones están desactivadas", () => {
    const obj = {
      a: null,
      b: undefined,
      c: "",
      d: "  text  ",
    };
    const cleaned = cleanObject(obj, {
      removeNull: false,
      removeUndefined: false,
      trimStrings: false,
      removeEmptyStrings: false,
    });
    expect(cleaned).toEqual({ a: null, b: undefined, c: "", d: "  text  " });
  });

  it("Elimina solo propiedades null si se especifica", () => {
    const obj = {
      a: 1,
      b: null,
      c: undefined,
      d: "test",
      e: "",
    };
    const cleaned = cleanObject(obj, {
      removeUndefined: false,
      removeEmptyStrings: false,
    });
    expect(cleaned).toEqual({ a: 1, c: undefined, d: "test", e: "" });
  });

  it("Si se pasa un objeto vacío, retorna un objeto vacío", () => {
    const obj = {};
    const cleaned = cleanObject(obj);
    expect(cleaned).toEqual({});
  });
});
