import { modeAtom, sellSubAtom } from "@/store"
import { useAtomValue } from "jotai"

import Products from "."
import Slots from "../slots/slots.main"
import BarcodeResult from "./barcodeResult.market"
import Search from "./components/search/search.main"
import ProductCategories from "./productCategories.main"
import ProductFilter from "./productFilter"

const ProductsContainer = () => {
  const mode = useAtomValue(modeAtom)
  const sellSub = useAtomValue(sellSubAtom)
  return (
    <>
      <div className="-mt-1 flex flex-none items-center pb-3 pr-3">
        <Search />
        <div className="flex flex-auto overflow-hidden">
          <ProductCategories />
        </div>
        {sellSub && <ProductFilter />}
      </div>
      <div className="flex flex-auto overflow-hidden relative">
        {mode !== "restaurant" && <Slots />}
        <Products />
        <BarcodeResult />
      </div>
    </>
  )
}

export default ProductsContainer
