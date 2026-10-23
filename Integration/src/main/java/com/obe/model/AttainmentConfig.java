package com.obe.model;

public class AttainmentConfig {
    private int id;
    private double targetMarkPct;
    private double level1Pct;
    private double level2Pct;
    private double level3Pct;
    private double directWeight;
    private double indirectWeight;

    public AttainmentConfig() {}

    public AttainmentConfig(int id, double targetMarkPct, double level1Pct, double level2Pct, double level3Pct, double directWeight, double indirectWeight) {
        this.id = id;
        this.targetMarkPct = targetMarkPct;
        this.level1Pct = level1Pct;
        this.level2Pct = level2Pct;
        this.level3Pct = level3Pct;
        this.directWeight = directWeight;
        this.indirectWeight = indirectWeight;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public double getTargetMarkPct() { return targetMarkPct; }
    public void setTargetMarkPct(double targetMarkPct) { this.targetMarkPct = targetMarkPct; }

    public double getLevel1Pct() { return level1Pct; }
    public void setLevel1Pct(double level1Pct) { this.level1Pct = level1Pct; }

    public double getLevel2Pct() { return level2Pct; }
    public void setLevel2Pct(double level2Pct) { this.level2Pct = level2Pct; }

    public double getLevel3Pct() { return level3Pct; }
    public void setLevel3Pct(double level3Pct) { this.level3Pct = level3Pct; }

    public double getDirectWeight() { return directWeight; }
    public void setDirectWeight(double directWeight) { this.directWeight = directWeight; }

    public double getIndirectWeight() { return indirectWeight; }
    public void setIndirectWeight(double indirectWeight) { this.indirectWeight = indirectWeight; }
}
