import { ItemCategory } from '../item-categories/item-category.model';
import { CostCategory } from '../cost-categories/cost-category.model';
import { Pricing } from '../pricings/pricing.model';   

export class Item {
    id: number
    name: string
    description: string
    image: string
    item_category: ItemCategory
    cost_category: CostCategory
    pricings: Pricing[]
}