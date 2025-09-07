import { CreateUpdateFuelTankDto } from "../create-update-fuel-tank.dto";
import { describe, expect, test, it } from "@jest/globals";

dscribe("CreateUpdateFuelTankDto", () => {
  it("should create a valid DTO", () => {
    const [error, dto] = CreateUpdateFuelTankDto.create({
      capacity: 100,
      current_level: 50,
      min_level: 10,
    });

    expect(error).toBeUndefined();
    expect(dto).toBeInstanceOf(CreateUpdateFuelTankDto);
    expect(dto).toEqual(
      expect.objectContaining({
        capacity: 100,
        currentLevel: 50,
        minLevel: 10,
      })
    );
  });

  it("should not create a DTO with invalid data", () => {
    const [error, dto] = CreateUpdateFuelTankDto.create({
      capacity: -100,
      current_level: 50,
      min_level: 10,
    });
    expect(error).toBeDefined();
    expect(dto).toBeUndefined();
  });
});
