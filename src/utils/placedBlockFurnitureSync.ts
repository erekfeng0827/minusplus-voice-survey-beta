import { FurnitureItem, PlacedBlockItem } from '../types';

export function linkPlacedBlockToFurniture(
  block: PlacedBlockItem,
  furnitureId: string
): PlacedBlockItem {
  return { ...block, furnitureId };
}

export function syncFurnitureFromPlacedBlocks(
  furniture: FurnitureItem[] = [],
  blocks: PlacedBlockItem[] = []
): FurnitureItem[] {
  const byFurnitureId = new Map(
    blocks.filter((block) => block.furnitureId).map((block) => [block.furnitureId as string, block])
  );
  return furniture.map((item) => {
    const block = byFurnitureId.get(item.id);
    if (!block) return item;
    return {
      ...item,
      x: block.x,
      y: block.y,
      width: block.widthCm,
      depth: block.depthCm,
      height: block.heightCm ?? item.height,
      elevation: block.elevationCm ?? item.elevation,
      rotationY: block.rotationDeg ?? item.rotationY ?? 0,
    };
  });
}

export function removeLinkedFurniture(
  furniture: FurnitureItem[] = [],
  block?: PlacedBlockItem
): FurnitureItem[] {
  if (!block?.furnitureId) return furniture;
  return furniture.filter((item) => item.id !== block.furnitureId);
}
