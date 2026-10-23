package com.obe.model;

public class CoPoMapping {
    private int id;
    private int coId;
    private String coCode;
    private int poId;
    private String poCode;
    private int strength; // 0=None, 1=Low, 2=Medium, 3=High

    public CoPoMapping() {}

    public CoPoMapping(int id, int coId, int poId, int strength) {
        this.id = id;
        this.coId = coId;
        this.poId = poId;
        this.strength = strength;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getCoId() { return coId; }
    public void setCoId(int coId) { this.coId = coId; }

    public String getCoCode() { return coCode; }
    public void setCoCode(String coCode) { this.coCode = coCode; }

    public int getPoId() { return poId; }
    public void setPoId(int poId) { this.poId = poId; }

    public String getPoCode() { return poCode; }
    public void setPoCode(String poCode) { this.poCode = poCode; }

    public int getStrength() { return strength; }
    public void setStrength(int strength) { this.strength = strength; }
}
