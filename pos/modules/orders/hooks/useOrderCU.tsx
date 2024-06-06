import {
  modeAtom,
  refetchOrderAtom,
  refetchUserAtom,
  sellSubAtom,
  uomsAtom,
} from "@/store"
import { cartAtom, cartChangedAtom } from "@/store/cart.store"
import { orderValuesAtom } from "@/store/order.store"
import {
  ApolloCache,
  ApolloError,
  DefaultContext,
  MutationFunctionOptions,
  OperationVariables,
  useMutation,
} from "@apollo/client"
import { useAtomValue, useSetAtom } from "jotai"

import { Customer } from "@/types/customer.types"
import { useToast } from "@/components/ui/use-toast"

import { mutations } from "../graphql"

const useOrderCU = (onCompleted?: (id: string) => void) => {
  const { toast } = useToast()

  const { customer, type, _id, slotCode, ...rest } =
    useAtomValue(orderValuesAtom)

  const sellSub = useAtomValue(sellSubAtom)
  const uoms = useAtomValue(uomsAtom)
  const items = useAtomValue(cartAtom)
  const origin = useAtomValue(modeAtom)

  const setRefetchUser = useSetAtom(refetchUserAtom)
  const setRefetchOrder = useSetAtom(refetchOrderAtom)
  const setCartChanged = useSetAtom(cartChangedAtom)

  // TODO: get type default from config
  const variables = {
    ...rest,
    _id,
    customerId: (customer as Customer)?._id,
    origin,
    type: type || "eat",
    slotCode: slotCode || null,
  }

  const onError = (error: ApolloError) => {
    toast({ description: error.message, variant: "destructive" })
  }

  const handleOnComplete = (_id: string) => {
    setRefetchUser(true)
    setRefetchOrder(true)
    setCartChanged(false)
    return onCompleted && onCompleted(_id)
  }

  const [ordersAdd, { loading }] = useMutation(mutations.ordersAdd, {
    variables,
    onCompleted(data) {
      handleOnComplete(data?.ordersAdd?._id)
    },
    onError,
    refetchQueries: ["PoscSlots"],
  })

  const [ordersEdit, { loading: loadingEdit }] = useMutation(
    mutations.ordersEdit,
    {
      variables,
      onCompleted(data) {
        handleOnComplete(data?.ordersEdit?._id)
      },
      refetchQueries: ["orderDetail", "PoscSlots"],
      onError,
    }
  )

  const valitdateOrder: ValidateOrder = (options) => {
    if (sellSub) {
      if (!(customer as Customer)?._id) {
        return toast({
          description:
            "'Subscription' төрөлтэй бараа байгаа тул хэрэглэгч сонгоно уу",
        })
      }

      const usedUoms = uoms.filter((uom) =>
        items.find((item) => item.uom === uom.code)
      )

      if (usedUoms.length > 1) {
        return toast({
          description:
            "Нэгээс олон 'subscription' төрөлтэй бүтээгдэхүүн зэрэг худалдах боломжгүй",
        })
      }
    }
    if (_id) {
      return ordersEdit(options)
    }
    return ordersAdd(options)
  }

  return {
    orderCU: valitdateOrder,
    loading: loading || loadingEdit,
    variables,
  }
}

type ValidateOrder = (
  options?:
    | MutationFunctionOptions<
        any,
        OperationVariables,
        DefaultContext,
        ApolloCache<any>
      >
    | undefined
) => void

export default useOrderCU
