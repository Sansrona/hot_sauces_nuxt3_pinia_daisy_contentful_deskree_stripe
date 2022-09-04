<script setup>
const checkAll = ref();
const selected = ref([]);
const cartStore = useCartStore();
const loading = ref(false);

async function handleCheckout() {
  loading.value = true;
  
  
  const res = await $fetch("/api/cart", {
    method: "POST",
    body: {
      // ids: cartStore.items.map(product => product.item.sys.id)
       products: cartStore.items,
    },
  });
  window.location = res.url;
}

const deleteFromCart = () => {
  for (const id of selected.value) {
    cartStore.deleteFromCart(id);
  }

  selected.value = [];
}
</script>
<template>
  <div class="m-10">
    <h1 class="text-3xl mb-5 font-bold">Your Cart</h1>
    <div class="md:flex w-full">
      <div class="md:w-3/4">
        <!-- Use this markup to display an empty cart -->
        <div v-if="!cartStore.items.length" class="italic text-center pt-10">
          Cart is empty
        </div>
        <div v-else class="overflow-x-auto">
          <div class="table w-full">
            <table class="w-full">
              <!-- head -->
              <thead>
                <tr>
                  <th>
                    <label>
                      <input type="checkbox" class="checkbox" ref="checkAll" />
                    </label>
                  </th>
                  <th></th>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Number of Items</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="({ item, amount }, i) in cartStore.items">
                  <th>
                    <label>
                      <input v-model="selected" type="checkbox" class="checkbox" @change="checkAll.checked = false"
                        :value="item.sys.id" />
                    </label>
                  </th>
                  <td>
                    <div class="flex items-center space-x-3">
                      <div class="avatar">
                        <div class="mask mask-squircle w-12 h-12">
                          <img :src="item.fields.image[0].fields?.file.url"
                            :alt="item.fields.image[0].fields?.file.description" />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="font-bold">
                      {{ item.fields.name }}
                    </div>
                    <ProductHeat :heat-level="item.fields.heatLevel[0]" />
                  </td>
                  <td>
                    <ProductPrice :price="item.fields.price" />
                  </td>

                  <td>
                    <input v-model="cartStore.items[i].amount" class="input input-bordered w-20" min="0"
                      type="number" />
                  </td>
                  <th>
                    <NuxtLink :to="{
                      name: 'products-id',
                      params: { id: item.sys.id },
                    }">
                      <button class="btn btn-ghost btn-xs">details</button>
                    </NuxtLink>
                  </th>
                </tr>
              </tbody>
            </table>
            <button v-if="selected.length" @click="deleteFromCart" class="text-sm text-red-500">
              Remove Selected
            </button>
          </div>
        </div>
      </div>

      <div class="md:w-1/4 pl-5">
        <div class="card bg-slate-50">
          <div class="card-body">
            <ul>
              <li><strong>Subtotal</strong>:
                <ProductPrice :price="cartStore.itemsSubtotal" />
              </li>
              <li><strong>Estimated Taxes </strong>:
                <ProductPrice :price="cartStore.tax" />
              </li>
              <li><strong>Total</strong>:
                <ProductPrice :price="cartStore.totalSum" />
              </li>
            </ul>
            <div class="card-actions justify-end w-full">
              <AppButton class="btn-primary w-full" @click="handleCheckout" :loading="loading">
                Checkout
              </AppButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
