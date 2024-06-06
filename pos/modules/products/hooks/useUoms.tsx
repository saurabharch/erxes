import { uomsAtom } from "@/store"
import { configAtom } from "@/store/config.store"
import { useQuery } from "@apollo/client"
import { useAtomValue, useSetAtom } from "jotai"

import { IUom } from "@/types/product.types"
import { toast } from "@/components/ui/use-toast"

import { queries } from "../graphql"

const useUoms = () => {
  const config = useAtomValue(configAtom)
  const setUoms = useSetAtom(uomsAtom)

  const { data, loading } = useQuery(queries.uoms, {
    onCompleted({ uoms }) {
      setUoms((uoms || []).filter((uom: IUom) => uom?.isForSubscription))
    },
    onError(error) {
      toast({
        title: "Uoms error",
        description: error.message,
        variant: "destructive",
      })
    },
    context: {
      headers: {
        "erxes-app-token": config?.erxesAppToken,
      },
    },
  })

  const { uoms } = data || {}
  return { loading, uoms }
}

export default useUoms
