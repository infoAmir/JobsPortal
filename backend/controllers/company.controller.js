import { response } from "express";
import { Company } from "../models/company.model.js";

export const registryCompany = async (req, res) => {
  try {
    const { CompanyName } = req.body;
    if (!CompanyName) {
      return res.status(400).json({
        message: "Company Name is required",
        success: false,
      });
    }
    let CompanyExist = await Company.findOne({ name: CompanyName });

    if (!CompanyExist) {
      return res.status(401).json({
        message: "Company is already Exist",
        success: false,
      });
    }
    CompanyExist = await Company.create({
      name: CompanyName,
      userId: req.id,
    });

    return response.status(200).json({
      message: "Company Created Successfully",
      Company,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getCompany = async (req, res) => {
  try {
    const userId = req.id;
    const companies = await Company.findOne({ userId });
    if (!companies) {
      return res.status(401).json({
        message: "Sorry Company is not exits",
        success: false,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

export const getCompanyById = async (req, res) => {
  try {
    const UserId = req.params.id;
    const company = await Company.findOne({ UserId });
    if (!company) {
      return res.status(401).json({
        message: "Company not found",
        success: false,
      });
    }
    return res.status(200).json({
      Company,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const updatecompany = async (req, res) => {
  try {
    const { name, description, website, location } = req.body;
    const { file } = req.file;

    const updateData = { name, description, website, location };
    const update = await Company.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!update) {
      return res.status(404).json({
        message: "company is not updated",
        success: false,
      });
    }

    return res.status(200).json({
      message: "data Updated successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};
