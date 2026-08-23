from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator


def grover_search(target_index):

    # We have 8 possible positions:
    # 0, 1, 2, 3, 4, 5, 6, 7
    # 8 = 2^3, therefore we need 3 qubits.
    n = 3

    qc = QuantumCircuit(n, n)

    # ==========================================
    # STEP 1: Create superposition
    # ==========================================

    for qubit in range(n):
        qc.h(qubit)

    # ==========================================
    # STEP 2: Oracle
    # ==========================================

    # Convert target index to 3-bit binary.
    target_bits = format(target_index, f"0{n}b")

    # Example:
    # target_index = 3
    # target_bits = "011"

    # We transform the target state into |111>
    # so that the controlled operation can mark it.

    for qubit in range(n):

        # Qiskit's qubit 0 corresponds to the
        # RIGHTMOST bit of the binary number.
        bit = target_bits[n - 1 - qubit]

        if bit == "0":
            qc.x(qubit)

    # Apply a phase flip to |111>
    qc.h(n - 1)
    qc.mcx(list(range(n - 1)), n - 1)
    qc.h(n - 1)

    # Undo the transformation
    for qubit in range(n):

        bit = target_bits[n - 1 - qubit]

        if bit == "0":
            qc.x(qubit)

    # ==========================================
    # STEP 3: Grover diffusion operator
    # ==========================================

    for qubit in range(n):
        qc.h(qubit)

    for qubit in range(n):
        qc.x(qubit)

    qc.h(n - 1)
    qc.mcx(list(range(n - 1)), n - 1)
    qc.h(n - 1)

    for qubit in range(n):
        qc.x(qubit)

    for qubit in range(n):
        qc.h(qubit)

    # ==========================================
    # STEP 4: Measure
    # ==========================================

    qc.measure(range(n), range(n))

    # ==========================================
    # STEP 5: Run simulation
    # ==========================================

    simulator = AerSimulator()

    result = simulator.run(
        qc,
        shots=1000
    ).result()

    counts = result.get_counts()

    return counts


if __name__ == "__main__":

    target_index = 3

    counts = grover_search(target_index)

    print("Target index:", target_index)
    print("Target binary:", format(target_index, "03b"))
    print("Grover Search Results:")
    print(counts)