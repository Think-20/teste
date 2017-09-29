import { ItemCategory } from '../item-categories/item-category.model';
import { CostCategory } from '../cost-categories/cost-category.model';

export class Item {
    id: number
    name: string
    description: string
    price: number
    item_category?: ItemCategory
    cost_category?: CostCategory
}