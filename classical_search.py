def linear_search(data, target):
    comparisons = 0

    for index, value in enumerate(data):
        comparisons += 1

        if value == target:
            return {
                "found": True,
                "index": index,
                "comparisons": comparisons
            }

    return {
        "found": False,
        "index": -1,
        "comparisons": comparisons
    }