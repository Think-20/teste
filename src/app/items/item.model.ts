import { ItemCategory } from '../item-categories/item-category.model';
import { CostCategory } from '../cost-categories/cost-category.model';

export class Item {
    id: number
    name: string
    description: string
    price: number
    itemCategoryId?: number
    item_category?: ItemCategory
    costCategoryId?: number
    cost_category?: CostCategory
}