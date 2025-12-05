function Tweakwise_Hyva_Analytics(config) {
    return {
        values: config.values,
        bindItemClickEventsConfig: config.bindItemClickEventsConfig,
        init() {
            let bodyData = { values: this.values };

            fetch('/tweakwise/ajax/analytics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(bodyData)
            }).catch(error => console.error('Tweakwise API call failed:', error));

            // bindItemClickEvents
            if (this.bindItemClickEventsConfig) {
                const bindConfig = this.bindItemClickEventsConfig;
                const productList = document.querySelector(bindConfig.productListSelector);

                if (!bindConfig.twRequestId || !productList) {
                    return;
                }

                productList.addEventListener('click', function(event) {
                    if (event.target.closest(bindConfig.productSelector)) {
                        handleItemClick(event, bindConfig);
                    }
                }, true);
            }
        }
    }
}

function handleItemClick(event, config) {
    if (!this.analyticsEvents) {
        return;
    }

    const productList = document.querySelector(this.productListSelector);
    if (!productList) {
        return;
    }

    productList.addEventListener('click', (event) => {
        try {
            if (!this.twRequestId) {
                return;
            }

            const product = event.target.closest(this.productSelector);
            let productId;

            if (product) {
                //productId is the closest input with the name product of the product var
                productId = product.querySelector('input[name="product"]')?.value;
            } else {
                let visual = event.target.closest('.visual');
                if (!visual) {
                    let link = event.target.closest('a');
                    if (link) {
                        visual = link.querySelector('.visual');
                    }
                }
                if (visual) {
                    productId = visual.getAttribute('id');
                }
            }

            if (!productId) {
                return;
            }

            // Send async fetch request to the analytics endpoint
            fetch(this.analyticsEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({
                    type: 'itemclick',
                    value: productId,
                    requestId: this.twRequestId
                })
            }).catch((error) => {
                console.error('Error sending analytics event', error);
            });
        } catch (error) {
            console.error('Error handling product click event', error);
        }
    });
}
