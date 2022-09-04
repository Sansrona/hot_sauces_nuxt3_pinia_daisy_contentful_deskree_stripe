import { defineStore } from "pinia";
import { watchDebounced } from "@vueuse/shared";

export const useCartStore = defineStore("CartStore", () => {
  const items = ref([]);
  const isFirstLoad = ref(false);
  const deskree = useDeskree();


  watchDebounced(
    items,
    () => {
      if (isFirstLoad.value) return;
      deskree.user.updateCart(items.value);
    },
    { deep: true, debounce: 500 }
  );

  deskree.auth.onAuthStateChange(async (user) => {
    isFirstLoad.value = true;
    if (!user) return;
    const res = await deskree.user.getCart();
    items.value = res.products;
    isFirstLoad.value = false;
    setTimeout(() => (isFirstLoad.value = false), 1000);
  });

  const totalCount = computed(() =>
    items.value.reduce((acc, item) => acc + item.amount, 0)
  );
  const itemsSubtotal = computed(() =>
    items.value.reduce(
      (acc, item) => acc + item.item.fields.price * item.amount,
      0
    )
  );
  const tax = computed(() => itemsSubtotal.value / 10);
  const totalSum = computed(() => itemsSubtotal.value + tax.value);

  function addToCart(newItem) {
    const existingItem = items.value.find(
      (i) => i.item.sys.id === newItem.sys.id
    );
    if (existingItem) existingItem.amount++;
    else {
      items.value.push({ item: newItem, amount: 1 });
    }
  }

  function reset() {
    items.value = [];
  }

  function deleteFromCart(id) {
    items.value = items.value.filter((i) => i.item.sys.id !== id);
    console.log(items.value);
  }

  return {
    items,
    totalCount,
    itemsSubtotal,
    tax,
    totalSum,
    addToCart,
    deleteFromCart,
    isFirstLoad,
    reset,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCartStore, import.meta.hot));
}
