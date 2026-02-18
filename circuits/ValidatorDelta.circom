pragma circom 2.1.8;

template ValidatorDelta(n) {
    signal input prevBalances[n];
    signal input nextBalances[n];
    signal input expectedDelta; // public

    signal sumPrev[n + 1];
    signal sumNext[n + 1];
    sumPrev[0] <== 0;
    sumNext[0] <== 0;

    for (var i = 0; i < n; i++) {
        sumPrev[i + 1] <== sumPrev[i] + prevBalances[i];
        sumNext[i + 1] <== sumNext[i] + nextBalances[i];
    }

    expectedDelta === sumNext[n] - sumPrev[n];
}

component main { public [expectedDelta] } = ValidatorDelta(4);
