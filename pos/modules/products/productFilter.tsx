import { productsTypeAtom } from "@/store"
import { useAtom } from "jotai"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const ProductFilter = () => {
  const [productsType, setProductType] = useAtom(productsTypeAtom)
  return (
    <Select value={productsType} onValueChange={(type) => setProductType(type)}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select product type" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Product Type</SelectLabel>
          <SelectItem value="">All</SelectItem>
          <SelectItem value="product">Product</SelectItem>
          <SelectItem value="subscription">Subscription</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export default ProductFilter
